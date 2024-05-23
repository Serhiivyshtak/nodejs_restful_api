const http = require('http');
const fileSystem = require('fs');
const { setNewRequest } = require('./functions.js');

let products = require('./files/products.json');
const requests = require('./files/requests.json');

const server = http.createServer((request, response) => {

    response.setHeader('Content-Type', 'application/json');

    if (request.url === '/api/products' && request.method === 'GET') {

        response.statusCode = 200;
        response.end(JSON.stringify({responseHead: {statusCode: 200, message: 'Data fetched successfuly'}, responseBody: products}));
        const newRequest = setNewRequest(request, 'GET', 200, 'Get request successful. All data');
        requests.push(newRequest);
        fileSystem.writeFileSync('./files/requests.json', JSON.stringify(requests), 'utf-8');

    } else if (request.url.match(/\/api\/products\/([0-9]+)/) && +request.url.split('/').at(-1) <= products.length && request.method === 'GET') {

        let itemId = request.url.split('/').at(-1);
        for (let i = 0; i < products.length; i++) {
            if (products[i].id === itemId) {
                response.end(JSON.stringify({responseHead: {statusCode: 200, message: 'Data fetched successfuly'}, responseBody: products[i]}));
            }
        }
        response.statusCode = 200;
        const newRequest = setNewRequest(request, 'GET', 200, `Get request successful. Item with id ${itemId}`);
        requests.push(newRequest);
        fileSystem.writeFileSync('./files/requests.json', JSON.stringify(requests), 'utf-8');

    } else if ((request.url === '/api/products' || request.url === '/api/products/') && request.method === 'POST') {

        let requestBody = '';

        request.on('data', (chunk) => {
            requestBody += chunk;
        });

        request.on('end', () => {
            const dataParsed = JSON.parse(requestBody);
            
            if (dataParsed.name !== undefined && dataParsed.description !== undefined && dataParsed.price !== undefined) {

                let newProduct = {
                    id: (+products.at(-1).id + 1).toString(),
                    name: dataParsed.name,
                    description: dataParsed.description,
                    price: dataParsed.price
                }

                products.push(newProduct);
                fileSystem.writeFileSync('./files/products.json', JSON.stringify(products), 'utf-8');
                response.statusCode = 201;
                response.end(JSON.stringify({statusCode: 201, message: 'Product created', product: newProduct}));
                
                const newRequest = setNewRequest(request, 'POST', 201, `Post request successful. Item with id ${newProduct.id}`);
                requests.push(newRequest);
                fileSystem.writeFileSync('./files/requests.json', JSON.stringify(requests), 'utf-8');

            } else {

                response.statusCode = 400;
                response.end(JSON.stringify({statusCode: 400, message: 'Required values are not presented'}));

                const newRequest = setNewRequest(request, 'POST', 400, 'Post request failed. Required values wasn\'t presented');
                requests.push(newRequest);
                fileSystem.writeFileSync('./files/requests.json', JSON.stringify(requests), 'utf-8');

            }

        });
    } else if (request.url.match(/\/api\/products\/([0-9]+)/) && +request.url.split('/').at(-1) <= products.length && request.method === 'PATCH') {
        
        let itemId = request.url.split('/').at(-1);

        let requestBody = '';

        request.on('data', (chunk) => {
            requestBody += chunk;
        });

        request.on('end', () => {
            const dataParsed = JSON.parse(requestBody);

            for (let i = 0; i < products.length; i++) {
                if (products[i].id === itemId) {
                    products[i].name = dataParsed.name || products[i].name,
                    products[i].description = dataParsed.description || products[i].description,
                    products[i].price = dataParsed.price || products[i].price
                }
            }

            fileSystem.writeFileSync('./files/products.json', JSON.stringify(products), 'utf-8');
            response.statusCode = 200;
            response.end(JSON.stringify({statusCode: 200, message: `Product with id ${itemId} updated`}));

            const newRequest = setNewRequest(request, 'PATCH', 200, `Patch request successful. Product with id ${itemId}`);
            requests.push(newRequest);
            fileSystem.writeFileSync('./files/requests.json', JSON.stringify(requests), 'utf-8');

        });

    } else if (request.url.match(/\/api\/products\/([0-9]+)/) && +request.url.split('/').at(-1) <= products.length && request.method === 'DELETE') {

        let itemId = request.url.split('/').at(-1);

        products = products.filter(product => product.id !== itemId);
        fileSystem.writeFileSync('./files/products.json', JSON.stringify(products), 'utf-8');
        response.statusCode = 200;
        response.end(JSON.stringify({statusCode: 200, message: `Product with id ${itemId} deleted`}));

        const newRequest = setNewRequest(request, 'DELETE', 200, `Delete request successful. Product with id ${itemId}`);
        requests.push(newRequest);
        fileSystem.writeFileSync('./files/requests.json', JSON.stringify(requests), 'utf-8');

    } else {

        response.statusCode = 404;
        response.end(JSON.stringify({statusCode: 404, message: 'Data not found'}));

        const newRequest = setNewRequest(request, request.method, 404, `${request.method} request failed. Data not found or method not supported`);
        requests.push(newRequest);
        fileSystem.writeFileSync('./files/requests.json', JSON.stringify(requests), 'utf-8');

    }
});

const port = process.env.PORT || 5000;

server.listen(port, () => {
    console.log('server started');
});