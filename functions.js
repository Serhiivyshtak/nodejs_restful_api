let setNewRequest = (request, method, code, message) => {
    const now = new Date();
    const timeStringOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: 'numeric',
        second: 'numeric',
    }
    const formatedDate = now.toLocaleDateString('en-EN', timeStringOptions);
    return {
        requestDate: formatedDate,
        requestMethod: method,
        statusCode: code,
        message,
        requestFrom: request.socket.localAddress
    }
}

module.exports = {
    setNewRequest
}