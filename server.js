const http = require('http');
const fileSystem = require('fs');
const { setNewRequest } = require('./functions.js');

let products = require('./files/products.json');

const server = http.createServer((request, response) => {
    
    let log = {}

    response.setHeader('Content-Type', 'application/json');

    if (request.url === '/api/products' && request.method === 'GET') {

        response.statusCode = 200;
        response.end(JSON.stringify({responseHead: {statusCode: 200, message: 'Data fetched successfuly'}, responseBody: products}));

        log = setNewRequest(request, 'GET', 200, 'Get request successful. All data');

    } else if (request.url.match(/\/api\/products\/([0-9]+)/) && +request.url.split('/').at(-1) <= products.length && request.method === 'GET') {

        let itemId = request.url.split('/').at(-1);
        for (let i = 0; i < products.length; i++) {
            if (products[i].id === itemId) {
                response.end(JSON.stringify({responseHead: {statusCode: 200, message: 'Data fetched successfuly'}, responseBody: products[i]}));
            }
        }
        response.statusCode = 200;
        log = setNewRequest(request, 'GET', 200, `Get request successful. Item with id ${itemId}`);

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
                
                log = setNewRequest(request, 'POST', 201, `Post request successful. Item with id ${newProduct.id}`);

            } else {

                response.statusCode = 400;
                response.end(JSON.stringify({statusCode: 400, message: 'Required values are not presented'}));

                log = setNewRequest(request, 'POST', 400, 'Post request failed. Required values wasn\'t presented');

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

            log = setNewRequest(request, 'PATCH', 200, `Patch request successful. Product with id ${itemId}`);

        });

    } else if (request.url.match(/\/api\/products\/([0-9]+)/) && +request.url.split('/').at(-1) <= products.length && request.method === 'DELETE') {

        let itemId = request.url.split('/').at(-1);

        products = products.filter(product => product.id !== itemId);
        fileSystem.writeFileSync('./files/products.json', JSON.stringify(products), 'utf-8');
        response.statusCode = 200;
        response.end(JSON.stringify({statusCode: 200, message: `Product with id ${itemId} deleted`}));

        log = setNewRequest(request, 'DELETE', 200, `Delete request successful. Product with id ${itemId}`);


    } else {

        response.statusCode = 404;
        response.end(JSON.stringify({statusCode: 404, message: 'Data not found'}));

        log = setNewRequest(request, request.method, 404, `${request.method} request failed. Data not found or method not supported`);

    }

    console.log(log);
});

const port = process.env.PORT || 5000;

server.listen(port, () => {
    console.log('server started');
});