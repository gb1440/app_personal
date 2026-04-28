export const downloadBase64File = (fileData: string, fileName: string) => {
    try {
        if (!fileData) {
            console.error("Nenhum dado fornecido para download");
            return;
        }

        const dataStr = fileData.trim();

        if (dataStr.startsWith('data:')) {
            // Conversão síncrona evita que o navegador perca o "user gesture" 
            // e bloqueie o download
            const arr = dataStr.split(',');
            const mimeMatch = arr[0].match(/:(.*?);/);
            const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
            const base64Data = (arr[1] || arr[0]).replace(/\s/g, '');
            
            const bstr = atob(base64Data);
            const n = bstr.length;
            const u8arr = new Uint8Array(n);
            for (let i = 0; i < n; i++) {
                u8arr[i] = bstr.charCodeAt(i);
            }
            
            const blob = new Blob([u8arr], { type: mime });
            const url = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            
            // ATENÇÃO: Nunca revogar o URL rápido demais, pois o navegador 
            // pode atrasar o processo de download interno e falhar com 
            // "Not allowed to load local resource" se o blob sumir da memória.
            setTimeout(() => {
                try {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                } catch (e) {
                    // ignore
                }
            }, 30000); // 30 segundos!
            
        } else {
            // Pode ser "blob:" ou URL Externa normal
            const a = document.createElement('a');
            a.href = dataStr;
            a.download = fileName;
            
            // "Not allowed to load local resource" ocorre se usarmos _blank em blob:
            if (!dataStr.startsWith('blob:')) {
                a.target = '_blank';
            }
            
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                try { document.body.removeChild(a); } catch (e) {}
            }, 2000);
        }
    } catch (e) {
        console.error("Falha ao processar arquivo para download. Tentando fallback...", e);
        // Fallback para exibir de forma segura se atob bater no max size
        try {
            const a = document.createElement('a');
            a.href = fileData;
            a.download = fileName;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { document.body.removeChild(a); }, 2000);
        } catch (err) {}
    }
};
