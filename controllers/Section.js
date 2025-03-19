const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) => {
    try {
        // fetch data
        const {sectionName, courseId} = req.body;
        // validation
        if(!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Missing mandatory fields"
            });
        }
        // create one
        const newSection = await Section.create({sectionName});
        // update in course as well
        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId,
            {
                $push: {
                    courseContent: newSection._id,
                }
            },
            {new: true}
        ).populate({
            path: "courseContent",
            populate: {
                path: "subSection",
                model: "subSection"
            }
        })
        .exec();
        // ret res
        return res.status(200).json({
            success: true,
            message: "Section created successfully!",
            updatedCourseDetails
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: true,
            message: "Error while section creation"
        });
    }
};


exports.updateSection = async (req, res) => {
    try {
        // fetch data
        const {sectionName, sectionId} = req.body;

        // validate
        if(!sectionName || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "Missing mandatory fields"
            });
        }

        // update in db
        const updatedSection = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});

        // ret res
        return res.status(200).json({
            success: true,
            message: "Section updated Successfully!"
        });
    } catch(error) {
        return res.status(500).json({
            success: false,
            message: "Error while updating section",
            error: error.message,
        });
    }
};

exports.deleteSection = async (req, res) => {
    try {
        // get ID - will get in params
        const {sectionId} = req.params;

        // del from db
        await Section.findByIdAndDelete(sectionId);
        // ret res
        return res.status(200).json({
            success: true,
            message: "Section deleted successfully!"
        });
    } catch(error) {
        return res.status(500).json({
            success: false,
            message: "Error while updating section",
            error: error.message
        });
    }
};