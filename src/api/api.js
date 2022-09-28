import axios from 'axios';



// 删除派出所时间段影响的会见
export const login = params => {
    return axios.post('http://127.0.0.1:8000/login', params, {
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(res => res.data);
};
