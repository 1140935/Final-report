// 預設的餐廳資料庫 (這裡可以換成你們學校附近的店)
const defaultRestaurants = [
    { name: "學餐自助餐", category: "飯類", price: "低" },
    { name: "校門口乾麵", category: "麵類", price: "低" },
    { name: "轉角義大利麵", category: "西式", price: "中" },
    { name: "巷口麥當勞", category: "速食", price: "中" },
    { name: "豪華牛排館", category: "西式", price: "高" },
    { name: "阿嬤的滷肉飯", category: "飯類", price: "低" }
];

// 從 LocalStorage 讀取使用者自訂的餐廳，如果沒有就空陣列
let customRestaurants = JSON.parse(localStorage.getItem('myRestaurants')) || [];

let isDrawing = false; // 防止重複點擊抽籤

// 取得合併後的完整餐廳名單
function getAllRestaurants() {
    return [...defaultRestaurants, ...customRestaurants];
}

// 步驟三：自訂新增餐廳功能
function addRestaurant() {
    const inputArea = document.getElementById('new-restaurant');
    const newName = inputArea.value.trim();
    
    if (newName === "") {
        alert("請輸入餐廳名稱！");
        return;
    }

    // 預設分類為飯類，價格為中等 (你可以再擴充讓使用者選)
    const newObj = { name: newName, category: "飯類", price: "中" };
    customRestaurants.push(newObj);
    
    // 存入瀏覽器的 LocalStorage，這樣重整網頁資料不會不見！
    localStorage.setItem('myRestaurants', JSON.stringify(customRestaurants));
    
    inputArea.value = "";
    alert(`已將「${newName}」加入抽籤池！`);
}

// 步驟二 & 三：篩選與進階抽籤動畫
function startDraw() {
    if (isDrawing) return; // 動畫執行中不可重複點擊

    const categoryFilter = document.getElementById('category-filter').value;
    const priceFilter = document.getElementById('price-filter').value;
    const resultBox = document.getElementById('result-box');
    const mapLink = document.getElementById('map-link');

    // 1. 根據使用者的選擇過濾餐廳
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
    mapLink.style.display = "none"; // 動畫期間隱藏地圖連結
    
    // 2. 步驟二：進階跑馬燈動畫效果
    let counter = 0;
    const duration = 2000; // 動畫總時長 2 秒
    const speed = 50; // 每 50 毫秒切換一次名字

    // 使用 setInterval 創造名字快速切換的視覺效果
    const timer = setInterval(() => {
        // 隨機從過濾後的池子挑選名字顯示
        const randomIndex = Math.floor(Math.random() * pool.length);
        resultBox.innerText = pool[randomIndex].name;
        counter += speed;

        // 當時間到了，停止動畫並顯示最終結果
        if (counter >= duration) {
            clearInterval(timer);
            
            // 決定最終贏家
            const finalWinner = pool[Math.floor(Math.random() * pool.length)];
            resultBox.innerText = `🎉 ${finalWinner.name} 🎉`;
            
            // 設定 Google Maps 搜尋連結
            mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(finalWinner.name)}`;
            mapLink.style.display = "inline-block";
            
            isDrawing = false; // 解除鎖定
        }
    }, speed);
}
// ====== 新增：Google Maps 附近餐廳抓取功能 ======

// 建立一個隱藏的 div 來放置 Google Maps 服務需要的實體
const mapContainer = document.createElement('div');
let placesService;

// ====== 新增：Google Maps 附近餐廳抓取功能 (2025 新版 API) ======

async function fetchNearbyRestaurants() {
    const statusText = document.getElementById('location-status');
    statusText.innerText = "正在取得您的位置...";

    // 1. 取得經緯度
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

// 2. 呼叫最新的 Place API 搜尋 1000 公尺內的餐廳
async function searchPlaces(lat, lng, statusText) {
    try {
        // 設定新版 API 的搜尋條件
        const request = {
            fields: ['displayName', 'priceLevel'], // 我們只需要餐廳名稱跟價位
            locationRestriction: {
                center: { lat: lat, lng: lng },
                radius: 1000, // 1 公里
            },
            includedPrimaryTypes: ['restaurant'],
            maxResultCount: 20, // 最多抓取 20 家
        };

        // 呼叫新版 searchNearby 方法 (使用 await)
        const { places } = await google.maps.places.Place.searchNearby(request);

        if (places && places.length > 0) {
            customRestaurants = []; 
            
            // 整理資料格式
            places.forEach(place => {
                let priceStr = "中";
                // 新版 API 價位回傳格式改變了
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
