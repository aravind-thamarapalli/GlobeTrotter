export const mockUser = {
    id: 1,
    name: "Demo Traveler",
    email: "demo@example.com",
    role: "admin",
    avatar_url: "https://images.unsplash.com/photo-1599566150163-29194dcaad36"
};

export const mockTrips = [
    {
        id: 1,
        title: "Summer in Japan",
        start_date: "2024-06-15",
        end_date: "2024-06-30",
        cover_photo_url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
        is_public: true,
        public_slug: "japan-summer-2024",
        stops: [
            {
                id: 1,
                city_name: "Tokyo",
                city_country: "Japan",
                city_image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989",
                activities: [
                    { id: 1, name: "Shibuya Crossing", type: "sightseeing", cost: 0, scheduled_at: "2024-06-16T10:00:00" },
                    { id: 2, name: "Sushi Making", type: "food", cost: 80, scheduled_at: "2024-06-16T13:00:00" }
                ]
            },
            {
                id: 2,
                city_name: "Kyoto",
                city_country: "Japan",
                city_image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
                activities: []
            }
        ]
    },
    {
        id: 2,
        title: "Paris Getaway",
        start_date: "2024-09-10",
        end_date: "2024-09-15",
        cover_photo_url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
        is_public: false,
        stops: []
    }
];

export const mockStats = {
    users: 1250,
    trips: 3420,
    cities: 50,
    activities: 1200,
    popularCities: [
        { name: 'Tokyo', visit_count: 450 },
        { name: 'Paris', visit_count: 380 },
        { name: 'New York', visit_count: 310 }
    ]
};
