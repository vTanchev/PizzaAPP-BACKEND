const { ObjectId } = require("mongodb");

let ordersCollection;
exports.registerMongoClient = (_client) => {
    ordersCollection = _client.db('pizza-app').collection('orders');
};

exports.getAll = async (req, res) => {
    try {
        const orders = await ordersCollection.find().toArray();
        return res.json(orders);
    } catch (e) {
        console.error(e);
        res.sendStatus(400);
    }
};

exports.insertOne = async (req, res) => {
    const order = req.body;
    try {
        await ordersCollection.insertOne(order);
        res.send({message: 'Success on writing order', data: JSON.stringify(order)});
    } catch (e) {
        console.error(e);
        if (e.code === 11000) {
            res.send({message: 'Order with that ID already exists'});
        }
        res.sendStatus(400);
    }
};

exports.deleteOne = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await ordersCollection.deleteOne({_id: ObjectId(id)});
        console.log(`Deleted order ${id}`);
        res.json(result);
    } catch (e) {
        console.error(e);
    }
};

exports.updateOne = async (req, res) => {
    const id = req.params.id;
    const newOrder = req.body;
    try {
        console.log(`Updating order ${id}`);
        console.log(newOrder);
        const result = await ordersCollection.findOneAndUpdate(
            { _id: ObjectId(id) },
            { $set: newOrder },
        );
        res.json(result);
    } catch (e) {
        console.error(e);
    }
};