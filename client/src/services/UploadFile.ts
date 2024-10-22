import * as fileSystem from 'expo-file-system';
import axios from 'axios';


const handleUploadFile = async (fileUrl: string, ref: string, fileType: string) => {
    try {
        const filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
        const fileExtension = filename.split('.').pop();
        const response = await axios.post('/api/v1/media/upload', { filename, ref });
        const { uploadUrl, mediaUrl, success } = response.data;
        if (success) {
            const uploaded = await fetch(uploadUrl, {
                method: 'PUT',
                body: await fileSystem.getInfoAsync(fileUrl) as any,
                headers: {
                    'Content-Type': `${fileType}/${fileExtension}`
                }
            })
            if (uploaded?.status === 200) {
                return { success: true, url: mediaUrl }
            }
        }
    } catch (error) {
        throw error;
    };
};

export default handleUploadFile;