"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWishlistData = exports.RemoveData = exports.AddData = exports.getFilteredData = void 0;
const marketDepthDataArray = [
    { name: 'TCS', isAdded: false },
    { name: 'IBM', isAdded: false },
    { name: 'TATA', isAdded: false },
    { name: 'TSLA', isAdded: false },
    { name: 'AAPL', isAdded: false },
    { name: 'GOOGL', isAdded: false },
    { name: 'AMZN', isAdded: false },
    { name: 'NFLX', isAdded: false },
    { name: 'RELIANCE', isAdded: false },
    { name: 'INFY', isAdded: false },
    { name: 'HDFC', isAdded: false },
    { name: 'ICICIBANK', isAdded: false },
    { name: 'SBIN', isAdded: false },
    { name: 'TATAMOTORS', isAdded: false },
    { name: 'BHARTIARTL', isAdded: false },
    { name: 'WIPRO', isAdded: false },
    { name: 'HCLTECH', isAdded: false },
    { name: 'HDFCBANK', isAdded: false },
];
const selectedData = [];
const getFilteredData = (req, res) => {
    const query = req.body.query; // Get the query parameter from the request
    console.log(query);
    const filteredData = marketDepthDataArray.filter((symbol) => symbol.name.includes(query.toUpperCase()));
    res.json(filteredData); // Send the array as JSON response
};
exports.getFilteredData = getFilteredData;
const getWishlistData = (req, res) => {
    res.json(selectedData);
};
exports.getWishlistData = getWishlistData;
const AddData = (req, res) => {
    const { name, isAdded } = req.body;
    const newData = { name, isAdded };
    selectedData.push(newData);
    marketDepthDataArray[marketDepthDataArray.findIndex((data) => data.name === name)].isAdded = true;
    res.json("added data");
    console.log("Added", selectedData);
};
exports.AddData = AddData;
const RemoveData = (req, res) => {
    const { name } = req.body;
    const index = selectedData.findIndex((data) => data.name === name);
    if (index !== -1) {
        selectedData.splice(index, 1);
    }
    marketDepthDataArray[marketDepthDataArray.findIndex((data) => data.name === name)].isAdded = false;
    res.json("removed data");
    console.log("Removed", selectedData);
};
exports.RemoveData = RemoveData;
