async function LoadJson(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                resolve(json);
            } catch (error) {
                reject("JSON Parsing Failed");
            }
        };

        reader.onerror = () => {
            reject("Failed");
        };
        reader.readAsText(file);
    });
}