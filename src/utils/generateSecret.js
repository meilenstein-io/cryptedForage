export default function generateSecret(len) {
    let randomString = '';
    for (let i = 0; i < len; i++) {
        randomString =
            randomString +
            Math.random()
                .toString(36)
                .substr(2, 8);
    }
    return randomString.substr(0, len);
}
