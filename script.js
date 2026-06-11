// 預設的餐廳資料庫
const defaultRestaurants = [
    { name: "學餐自助餐", category: "飯類", price: "低" },
    { name: "校門口乾麵", category: "麵類", price: "低" },
    { name: "轉角義大利麵", category: "西式", price: "中" },
    { name: "巷口麥當勞", category: "速食", price: "中" },
    { name: "豪華牛排館", category: "西式", price: "高" },
    { name: "阿嬤的滷肉飯", category: "飯類", price: "低" }
];

let customRestaurants = JSON.parse(localStorage.getItem('myRestaurants')) || [];
let isDrawing = false;

function getAllRestaurants() {
    return [...defaultRestaurants, ...customRestaurants];
}

function addRestaurant() {
    const inputArea = document.getElementById('new-restaurant');
    const newName = inputArea.value.trim();
    if (newName === "") {
        alert("請輸入餐廳名稱！");
        return;
    }
    const newObj = { name: newName, category: "飯類", price: "中" };
    customRestaurants.push(newObj);
    localStorage.setItem('myRestaurants', JSON.stringify(customRestaurants));
    inputArea.value = "";
    alert(`已將「${newName}」加入抽籤池！`);
}

function startDraw() {
    if (isDrawing) return;

    const categoryFilter = document.getElementById('category-filter').value;
    const priceFilter = document.getElementById('price-filter').value;
    const resultBox = document.getElementById('result-box');
    const mapLink = document.getElementById('map-link');

    // 篩選邏輯
    const pool = getAllRestaurants().filter(item => {
        const matchCategory = categoryFilter === "all" || item.category === categoryFilter;
        const matchPrice = priceFilter === "all" || item.price === priceFilter;
        return matchCategory && matchPrice;
    });

    if (pool.length === 0) {
        resultBox.innerText = "沒有符合條件的餐廳😢";
        mapLink.style.display = "none";
        return;
    }

    isDrawing = true;
    mapLink.style.display = "none";
    
    let counter = 0;
    const duration = 2000;
    const speed = 50;

    const timer = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * pool.length);
        resultBox.innerText = pool[randomIndex].name;
        counter += speed;

        if (counter >= duration) {
            clearInterval(timer);
            const finalWinner = pool[Math.floor(Math.random() * pool.length)];
            resultBox.innerText = `🎉 ${finalWinner.name} 🎉`;
            mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(finalWinner.name)}`;
            mapLink.style.display = "inline-block";
            isDrawing = false;
        }
    }, speed);
}

// 2025 新版 Google Place API 抓取邏輯
async function fetchNearbyRestaurants() {
    const statusText = document.getElementById('location-status');
    statusText.innerText = "正在取得您的位置...";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                statusText.innerText = "位置取得成功！正在搜尋附近餐廳...";
                searchPlaces(lat, lng, statusText);
            },
            (error) => {
                statusText.innerText = "無法取得位置，請確認是否開啟定位權限！";
                console.error(error);
            }
        );
    } else {
        statusText.innerText = "您的瀏覽器不支援定位功能。";
    }
}

async function searchPlaces(lat, lng, statusText) {
    try {
        const request = {
            fields: ['displayName', 'priceLevel'],
            locationRestriction: {
                center: { lat: lat, lng: lng },
                radius: 1000,
            },
            includedPrimaryTypes: ['restaurant'],
            maxResultCount: 20,
        };

        const { places } = await google.maps.places.Place.searchNearby(request);

        if (places && places.length > 0) {
            customRestaurants = []; 
            places.forEach(place => {
                let priceStr = "中";
                if (place.priceLevel === 'PRICE_LEVEL_INEXPENSIVE') priceStr = "低";
                if (place.priceLevel === 'PRICE_LEVEL_EXPENSIVE' || place.priceLevel === 'PRICE_LEVEL_VERY_EXPENSIVE') priceStr = "高";

                customRestaurants.push({
                    name: place.displayName ? place.displayName.text : "未知餐廳",
                    category: "附近搜尋",
                    price: priceStr
                });
            });

            statusText.innerText = `✅ 成功抓取附近 ${places.length} 家餐廳！現在可以開始抽籤了。`;
            statusText.style.color = "green";

            // 自動將選單切換回「所有分類」，確保能抽到剛抓下來的餐廳！
            document.getElementById('category-filter').value = "all";
            document.getElementById('price-filter').value = "all";

        } else {
            statusText.innerText = "附近找不到餐廳😢，請稍後再試。";
            statusText.style.color = "red";
        }
    } catch (error) {
        console.error("Places API 錯誤:", error);
        statusText.innerText = "抓取失敗！請確認是否已啟用「Places API (New)」並綁定信用卡。";
        statusText.style.color = "red";
    }
}
