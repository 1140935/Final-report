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
    // 雖然拿掉篩選了，但內部還是給個預設值，確保資料格式統一
    const newObj = { name: newName, category: "自訂", price: "中" };
    customRestaurants.push(newObj);
    localStorage.setItem('myRestaurants', JSON.stringify(customRestaurants));
    inputArea.value = "";
    alert(`已將「${newName}」加入抽籤池！`);
}

// 更新：移除了分類與價格的過濾邏輯
function startDraw() {
    if (isDrawing) return;

    const resultBox = document.getElementById('result-box');
    const mapLink = document.getElementById('map-link');

    // 直接取得所有餐廳，不進行分類篩選
    const pool = getAllRestaurants();

    if (pool.length === 0) {
        resultBox.innerText = "沒有可抽籤的餐廳😢";
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

// 更新：讀取距離選單數值，並傳遞給搜尋函數
async function fetchNearbyRestaurants() {
    const statusText = document.getElementById('location-status');
    const radiusValue = document.getElementById('radius-select').value; // 取得使用者選擇的距離
    
    statusText.innerText = "正在取得您的位置...";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                statusText.innerText = `位置取得成功！正在搜尋 ${radiusValue} 公尺內的餐廳...`;
                
                // 把 radiusValue 傳給 searchPlaces
                searchPlaces(lat, lng, statusText, radiusValue); 
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

// 更新：接收 radius 參數，動態改變 Google 搜尋半徑
async function searchPlaces(lat, lng, statusText, radius) {
    try {
        const request = {
            fields: ['displayName', 'priceLevel'],
            locationRestriction: {
                center: { lat: lat, lng: lng },
                radius: parseInt(radius), // 使用動態半徑範圍
            },
            includedPrimaryTypes: ['restaurant'],
            maxResultCount: 20,
        };

        const { places } = await google.maps.places.Place.searchNearby(request);

        if (places && places.length > 0) {
            customRestaurants = []; 
            places.forEach(place => {
                customRestaurants.push({
                    name: place.displayName || "未知餐廳",
                    category: "附近搜尋",
                    price: "中" // 簡化價格屬性
                });
            });

            statusText.innerText = `✅ 成功抓取範圍內 ${places.length} 家餐廳！現在可以開始抽籤了。`;
            statusText.style.color = "green";

        } else {
            statusText.innerText = "指定範圍內找不到餐廳😢，請嘗試擴大範圍。";
            statusText.style.color = "red";
        }
    } catch (error) {
        console.error("Places API 錯誤:", error);
        statusText.innerText = "抓取失敗！請確認是否已啟用「Places API (New)」並綁定信用卡。";
        statusText.style.color = "red";
    }
}
