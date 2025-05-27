const API_BASE_URL = `${process.env.WORKER_URL}/api/${process.env.WORKER_VERSION}`;

export async function getUserInfo(userId) {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`);
    const data = await response.json();
    return { data, status: response.status };
}

export async function addUserInfo(userData) {
    const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    const data = await response.json();
    return { data, status: response.status };
}

export async function updateUser(userId, updateData) {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
        method: 'PATCH',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
    });
    const data = await response.json();
    return { data, status: response.status };
}