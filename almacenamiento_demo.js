/* Adaptador de demostración LULATRÉN: IndexedDB local, sin servidor. */
(function () {
    'use strict';
    const nativeFetch = window.fetch.bind(window);
    const dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open('LULATREN_DEMO', 1);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains('reservas')) db.createObjectStore('reservas', {keyPath:'id',autoIncrement:true});
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
    async function transact(mode, action) {
        const db = await dbPromise;
        return new Promise((resolve, reject) => {
            const tx = db.transaction('reservas', mode);
            const store = tx.objectStore('reservas');
            const req = action(store);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
            tx.onerror = () => reject(tx.error);
        });
    }
    function json(data, status=200) {return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});}
    function readBody(body) {return Object.fromEntries(new URLSearchParams(body).entries());}
    window.fetch = async function (input, options={}) {
        const path = typeof input === 'string' ? input : input.url;
        const endpoint = path.split('?')[0].split('/').pop();
        if (!['GuardarReservaServlet','GuardarEvaluacionServlet','ConsultarAdminServlet'].includes(endpoint)) return nativeFetch(input,options);
        try {
            if (endpoint === 'GuardarReservaServlet') {
                const p = readBody(options.body);
                const record = {
                    codigoTicket:p.codigo_ticket||'', nombre:p.nombre_titular||'',dpi:p.dpi_pasaporte||'',
                    ruta:p.ruta||'', numNinos:Number(p.total_pasajeros)||0,
                    montoTotal:Number(p.monto_total)||0,fechaEmision:new Date().toLocaleDateString('es-GT'),
                    encuesta:{usabilidad:'Pendiente',motivo:'Pendiente',aspectos:'',nps:0,frecuencia:0,comentarios:''}
                };
                const id = await transact('readwrite',s=>s.add(record));
                return json({status:'success',id_reserva:id});
            }
            if (endpoint === 'GuardarEvaluacionServlet') {
                const p=readBody(options.body), id=Number(p.id_reserva);
                const record=await transact('readonly',s=>s.get(id));
                if(!record)return json({status:'error',message:'Reserva no encontrada'},404);
                record.encuesta={usabilidad:p.usabilidad_p1||'',motivo:p.motivo_p2||'',aspectos:p.aspectos_p3||'',
                    nps:Number(p.nps_p4)||0,frecuencia:Number(p.frecuencia_p5)||0,comentarios:p.comentarios_p6||''};
                await transact('readwrite',s=>s.put(record));
                return json({status:'success'});
            }
            const records=await transact('readonly',s=>s.getAll());
            return json({reservas:records});
        } catch(error) {
            console.error('Error IndexedDB',error);
            return json({status:'error',message:'No se pudo guardar en este navegador'},500);
        }
    };
})();
