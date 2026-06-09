:root {
    --primary-color: #ff6b6b;
    --bg-color: #f7f9fc;
    --card-bg: #ffffff;
    --text-color: #333333;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: var(--bg-color);
    color: var(--text-color);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
}

.container {
    background-color: var(--card-bg);
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    width: 90%;
    max-width: 400px;
    text-align: center;
}

h1 {
    color: var(--primary-color);
    margin-bottom: 25px;
}

.filter-section, .add-section {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
}

select, input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
}

button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    transition: transform 0.1s, background-color 0.2s;
}

button:hover {
    background-color: #ff5252;
}

button:active {
    transform: scale(0.95);
}

#add-btn {
    background-color: #4ecdc4;
}

.draw-section {
    margin: 30px 0;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

#result-box {
    font-size: 28px;
    font-weight: bold;
    color: var(--text-color);
    margin-bottom: 15px;
    min-height: 40px;
}

#map-link {
    color: #4285f4;
    text-decoration: none;
    font-weight: bold;
    padding: 8px 15px;
    border: 1px solid #4285f4;
    border-radius: 20px;
    transition: all 0.2s;
}

#map-link:hover {
    background-color: #4285f4;
    color: white;
}

#draw-btn {
    width: 100%;
    font-size: 18px;
    padding: 15px;
}
