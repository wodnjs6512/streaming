import io from 'socket.io-client';

const GATEWAY_CONNECT_TIMEOUT = 5000;

const HOSTNAME = 'http://localhost:5005';

class ServerConnectionUtil {
    private client: any;
    serverConnect() {
        return new Promise((resolve, reject) => {
            const client = io(HOSTNAME, {
                path: '/vidinput',
                secure: true,
                rejectUnauthorized: false,
                timeout: GATEWAY_CONNECT_TIMEOUT,
                transports: ['websocket'],
            });
            client.on('open', () => {
                console.log('Server Connected');
                resolve(client);
            });
            client.on('connect', () => {
                console.log('socket connected');
            });
            client.on('disconnect', () => {
                console.log('closed');
            });
            client.on('connection_error', (error: Error) => {
                console.error('connect_error', error);
                reject(error);
            });
            client.on('connection_timeout', (timeout: any) => {
                console.error('connect_timeout', timeout);
                reject(timeout);
            });
            client.on('error', (error: Error) => {
                console.error('error', error);
                reject(error);
            });
            this.client = client;
        });
    }
}
export default ServerConnectionUtil;
