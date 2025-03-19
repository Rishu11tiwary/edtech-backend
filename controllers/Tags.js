const Category = require("../models/Category");

exports.createTag = async (req, res) => {
    try {
        const {name, descripton} = req.body;

        //vadidation
        if(!name || !descripton) {
            return res.status(400).json({
                success:false,
                message: "Mandatory fieids missing"
            })
        }

        //store in db
        const tagDetails = await Category.create({
            name: name,
            descripton: descripton
        });
        console.log(tagDetails);

        //ret resp
        return res.status(200).json({
            success: false,
            message: "Category cretaed successfully"
        });

        
    } catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


//get all tags
exports.showAllTags = async (req, res) => {
    try {
        //fetch and return
        const allTags = await Category.find({}, {name:true, descripton: true});
        return res.status(200).json({
            success: true,
            message: "All tags returned successfully",
            allTags
        })
    } catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}