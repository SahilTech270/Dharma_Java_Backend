const BASE_URL = "";

const getAuthToken = () => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        return user?.token;
    } catch (e) {
        return null;
    }
};

// --- User Management ---
export const registerAdmin = async (adminData) => {
    try {
        const response = await fetch(`${BASE_URL}/admin/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(adminData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to register admin");
        }
        return await response.json();
    } catch (error) {
        console.error("Error registering admin:", error);
        throw error;
    }
};

export const loginAdmin = async (credentials) => {
    try {
        const formData = new URLSearchParams();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        const response = await fetch(`${BASE_URL}/admin/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString(),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to login");
        }
        return await response.json();
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
};

export const getAdminProfile = async (token) => {
    try {
        const response = await fetch(`${BASE_URL}/admin/auth/me`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to fetch admin profile");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching admin profile:", error);
        throw error;
    }
};

export const updateAdminProfile = async (profileData, token) => {
    try {
        const response = await fetch(`${BASE_URL}/admin/auth/update`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(profileData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to update admin profile");
        }
        return await response.json();
    } catch (error) {
        console.error("Error updating admin profile:", error);
        throw error;
    }
};

export const deleteAdminProfile = async (token) => {
    try {
        const response = await fetch(`${BASE_URL}/admin/auth/delete`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to delete admin profile");
        }
        return await response.json();
    } catch (error) {
        console.error("Error deleting admin profile:", error);
        throw error;
    }
};


// --- Temples ---
export const getTemples = async () => {
    try {
        const response = await fetch(`${BASE_URL}/temples/`);
        if (!response.ok) throw new Error("Failed to fetch temples");
        return await response.json();
    } catch (error) {
        console.error("Error fetching temples:", error);
        throw error;
    }
};

export const getTemple = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/temples/${id}`);
        if (!response.ok) throw new Error("Failed to fetch temple");
        return await response.json();
    } catch (error) {
        console.error("Error fetching temple:", error);
        throw error;
    }
};

export const createTemple = async (templeData) => {
    try {
        const response = await fetch(`${BASE_URL}/temples/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(templeData),
        });
        if (!response.ok) throw new Error("Failed to create temple");
        return await response.json();
    } catch (error) {
        console.error("Error creating temple:", error);
        throw error;
    }
};

// --- Slots ---
export const createSlot = async (slotData) => {
    try {
        const token = getAuthToken();
        const response = await fetch(`${BASE_URL}/slots/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(slotData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to create slot");
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating slot:", error);
        throw error;
    }
};

export const getSlots = async (templeId) => {
    try {
        const url = templeId ? `${BASE_URL}/slots/?templeId=${templeId}` : `${BASE_URL}/slots/`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Failed to fetch slots");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching slots:", error);
        throw error;
    }
};

export const updateSlot = async (id, slotData) => {
    try {
        const token = getAuthToken();
        const response = await fetch(`${BASE_URL}/slots/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(slotData),
        });

        if (!response.ok) {
            throw new Error("Failed to update slot");
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating slot:", error);
        throw error;
    }
};

export const deleteSlot = async (id) => {
    try {
        const token = getAuthToken();
        const response = await fetch(`${BASE_URL}/slots/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to delete slot");
        }

        try {
            return await response.json();
        } catch (e) {
            return { success: true };
        }
    } catch (error) {
        console.error("Error deleting slot:", error);
        throw error;
    }
};

// --- Bookings ---
export const createBooking = async (bookingData) => {
    try {
        const response = await fetch(`${BASE_URL}/bookings/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookingData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to create booking");
        }
        return await response.json();
    } catch (error) {
        console.error("Error creating booking:", error);
        throw error;
    }
};

export const createKioskBooking = async (bookingData) => {
    try {
        const token = getAuthToken();

        const queryParams = new URLSearchParams();
        if (bookingData.slotId) queryParams.append('slotId', bookingData.slotId);
        if (bookingData.templeId) queryParams.append('templeId', bookingData.templeId);
        if (bookingData.date) queryParams.append('date', bookingData.date);

        const response = await fetch(`${BASE_URL}/bookings/kiosk/?${queryParams.toString()}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(bookingData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to create kiosk booking");
        }
        return await response.json();
    } catch (error) {
        console.error("Error creating kiosk booking:", error);
        throw error;
    }
};

export const getBookings = async () => {
    try {
        const token = getAuthToken();
        const response = await fetch(`${BASE_URL}/bookings/`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to fetch bookings");
        return await response.json();
    } catch (error) {
        console.error("Error fetching bookings:", error);
        throw error;
    }
};

export const getBookingById = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/bookings/${id}`);
        if (!response.ok) throw new Error("Failed to fetch booking");
        return await response.json();
    } catch (error) {
        console.error("Error fetching booking:", error);
        throw error;
    }
};

export const getUserBookings = async (uid) => {
    try {
        const response = await fetch(`${BASE_URL}/bookings/user/${uid}`);
        if (!response.ok) throw new Error("Failed to fetch user bookings");
        return await response.json();
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        throw error;
    }
};

export const updateBooking = async (id, bookingData) => {
    try {
        const response = await fetch(`${BASE_URL}/bookings/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookingData),
        });
        if (!response.ok) throw new Error("Failed to update booking");
        return await response.json();
    } catch (error) {
        console.error("Error updating booking:", error);
        throw error;
    }
};

export const deleteBooking = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/bookings/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete booking");
        return await response.json();
    } catch (error) {
        console.error("Error deleting booking:", error);
        throw error;
    }
};

// --- Participants ---
export const addParticipant = async (participantData) => {
    try {
        const response = await fetch(`${BASE_URL}/participant/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(participantData),
        });
        if (!response.ok) throw new Error("Failed to add participant");
        return await response.json();
    } catch (error) {
        console.error("Error adding participant:", error);
        throw error;
    }
};

export const getParticipant = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/participant/${id}`);
        if (!response.ok) throw new Error("Failed to fetch participant");
        return await response.json();
    } catch (error) {
        console.error("Error fetching participant:", error);
        throw error;
    }
};

export const getBookingParticipants = async (bid) => {
    try {
        const token = getAuthToken();
        const response = await fetch(`${BASE_URL}/participant/booking/${bid}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to fetch participants");
        return await response.json();
    } catch (error) {
        console.error("Error fetching participants:", error);
        throw error;
    }
};

export const updateParticipant = async (id, participantData) => {
    try {
        const response = await fetch(`${BASE_URL}/participant/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(participantData),
        });
        if (!response.ok) throw new Error("Failed to update participant");
        return await response.json();
    } catch (error) {
        console.error("Error updating participant:", error);
        throw error;
    }
};

export const deleteParticipant = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/participant/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete participant");
        return await response.json();
    } catch (error) {
        console.error("Error deleting participant:", error);
        throw error;
    }
};

// --- Payments ---
export const createPayment = async (paymentData) => {
    try {
        const response = await fetch(`${BASE_URL}/payment/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(paymentData),
        });
        if (!response.ok) throw new Error("Failed to create payment");
        return await response.json();
    } catch (error) {
        console.error("Error creating payment:", error);
        throw error;
    }
};

export const getPayment = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/payment/${id}`);
        if (!response.ok) throw new Error("Failed to fetch payment");
        return await response.json();
    } catch (error) {
        console.error("Error fetching payment:", error);
        throw error;
    }
};

// --- SarimaX Training Data ---
export const addTrainingData = async (data) => {
    try {
        // Endpoint: /training_data/add_training_data
        // Correction based on "Not Found" error and operation ID "add_training_data_training_data__post"
        // This implies the path is likely /training_data/add_training_data

        const response = await fetch(`${BASE_URL}/training_data/add_training_data`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to add training data");
        }
        return await response.json();
    } catch (error) {
        console.error("Error adding training data:", error);
        throw error;
    }
};
