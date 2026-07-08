import https from 'https';

https.get('https://source.unsplash.com/800x500/?football', (res) => {
    console.log('Status:', res.statusCode);
    if (res.statusCode >= 300 && res.statusCode < 400) {
        console.log('Redirect:', res.headers.location);
    }
}).on('error', (e) => {
    console.error(e);
});
