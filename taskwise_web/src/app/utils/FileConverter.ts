export class Utils{

    static BuffertoBase64Encode(buffer: number[]): string{
        let imageBase64Encode = '';
        buffer.forEach(data => imageBase64Encode += String.fromCharCode(data));
        return 'data:image/jpeg;base64,'+btoa(imageBase64Encode);
    }

    static toBase64(file: File){
        return new Promise((resolve, reject) =>
        {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        })
    }
}