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
    // 自己想吃的店，預設給它 5 顆星，確保不會被篩選掉
    const newObj = { name: newName, category: "自訂", price: "中", rating: 5.0 };
    customRestaurants.push(newObj);
    localStorage.setItem('myRestaurants', JSON.stringify(customRestaurants));
    inputArea.value = "";
    alert(`已將「${newName}」加入抽籤池！`);
}

function startDraw() {
    if (isDrawing) return;

    const resultBox = document.getElementById('result-box');
    const mapLink = document.getElementById('map-link');
    
    // 取得使用者選擇的最低評分限制
    const minRating = parseFloat(document.getElementById('rating-filter').value);

    // 進行評分過濾
    const pool = getAllRestaurants().filter(item => {
        const itemRating = item.rating || 0; // 如果沒有評分資料，預設為 0
        return itemRating >= minRating;
    });

    if (pool.length === 0) {
        resultBox.innerText = "該範圍與評分下沒有餐廳😢";
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
            
            // 決定最終結果時，順便把星星數印出來顯示
            const ratingDisplay = finalWinner.rating ? `(${finalWinner.rating}⭐)` : "";
            resultBox.innerText = `🎉 ${finalWinner.name} ${ratingDisplay} 🎉`;
            
            mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(finalWinner.name)}`;
            mapLink.style.display = "inline-block";
            isDrawing = false;
        }
    }, speed);
}

async function fetchNearbyRestaurants() {
    const statusText = document.getElementById('location-status');
    const radiusValue = document.getElementById('radius-select').value;
    
    statusText.innerText = "正在取得您的位置...";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                statusText.innerText = `位置取得成功！正在搜尋 ${radiusValue} 公尺內的餐廳...`;
                
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

async function searchPlaces(lat, lng, statusText, radius) {
    try {
        const request = {
            // 新增 'rating' 欄位，要求 Google 給我們店家評分
            fields: ['displayName', 'rating'],
            locationRestriction: {
                center: { lat: lat, lng: lng },
                radius: parseInt(radius),
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
                    rating: place.rating || 0 // 將 Google 評分存下來
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
