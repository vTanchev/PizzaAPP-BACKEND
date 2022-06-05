let pizzasCollection;
const fs = require('fs');
const path = require('path');
exports.registerMongoClient = (_client) => {
    pizzasCollection = _client.db('pizza-app').collection('pizzas');
};

exports.getAll = async (req, res) => {
    try {
        let { search, tags, page } = req.query;
        const pageSize = 10;
        console.log('tags', tags);
        if (tags && tags.length) {
            tags = JSON.parse(tags);
        }
        page = parseInt(page) || 1;
        let filterQuery = {};
        if (search && search.length) {
            filterQuery = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { ingredients: { $regex: search, $options: 'i' } },
                ],
            };
        }
        if (tags && tags.length) {
            filterQuery.tags = { $all: tags };
        } 
        console.log('filterQuery', filterQuery);
        const pizzas = await pizzasCollection
            .find(filterQuery)
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .toArray();
        return res.json(pizzas);
    } catch (e) {
        console.error(e);
        res.sendStatus(400);
    }
};

exports.getOne = async (req, res) => {
    const id = req.params.id;
    try {
        const pizza = await pizzasCollection.findOne({_id: id});
        res.json(pizza);
    } catch (e) {
        console.error(e);
    }
};

exports.insertOne = async (req, res) => {
    const pizza = req.body;
    try {
        const getExtention = (base64data) => base64data.substring("data:image/".length, base64data.indexOf(';base64'));
        const getBase64 = (base64data) => base64data.replace(/^data:image\/[a-z]+;base64,/, "");
        const imageName = pizza.name + '.' + getExtention(pizza.image);
        fs.writeFileSync(
            path.join('public', imageName), 
            new Buffer.from(getBase64(pizza.image), 'base64'),
        );
        pizza.image = 'http://localhost:8080/' + imageName;
        await pizzasCollection.insertOne(pizza);
        res.end();
    } catch (e) {
        console.error(e);
        if (e.code === 11000) {
            res.send({message: 'Pizza with that ID already exists'});
        }
        res.sendStatus(400);
    }
};

exports.deleteOne = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pizzasCollection.deleteOne({_id: id});
        res.json(result);
    } catch (e) {
        console.error(e);
    }
};

exports.updateOne = async (req, res) => {
    const id = req.params.id;
    const newPizza = req.body;
    try {
        const result = await pizzasCollection.findOneAndUpdate({_id: id}, {$set: newPizza});
        res.json(result);
    } catch (e) {
        console.error(e);
    }
};

