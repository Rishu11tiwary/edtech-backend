const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
require("dotenv").config();

exports.createSubSection = async(req, res) => {
    try {
        // data fetch 
        const { sectionId, title, timeDuration, description} = req.body;

        // extact file
        const vedio = req.files.vedioFile;

        // validate
        if(!sectionId || !title || !timeDuration || !description) {
            return res.status(400).json({
                success: false,
                message: "All fields (sectionId, title, timeDuration, description) are required.",
            });
        }

        // get url from cloudinary
        const uploadDetails = await uploadImageToCloudinary(vedio, process.env.FOLDER_NAME);

        // entry in db
        const subSectionDetails = await SubSection.create({
            title,
            timeDuration,
            description,
            vedioUrl: uploadDetails.secure_url
        });
        
        const updatedSectionDetails = await Section.findByIdAndUpdate(
            { _id: sectionId },
            { $push: { subSection: subSectionDetails._id } },
            { new: true }
          ).populate("subSection")

        if (!updatedSectionDetails) {
            return res.status(404).json({
                success: false,
                message: "Section not found. Please provide a valid sectionId.",
            });
        }

        // ret res
        return res.status(201).json({
            success: true,
            message: "SubSection created successfully.",
            updatedSectionDetails,
        });
    } catch (error) {
        console.error("Error in createSubSection:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Unable to create SubSection.",
            error: error.message,
        });
    }
}

// update subSection
exports.updateSubSection = async (req, res) => {
    try {
        // fetch data
        const { subSectionId, title, timeDuration, description } = req.body;

        // fetch video file if provided
        let vedioUrl = null;
        if (req.files && req.files.vedioFile) {
            const uploadDetails = await uploadImageToCloudinary(req.files.vedioFile, process.env.FOLDER_NAME);
            vedioUrl = uploadDetails.secure_url;
        }

        // update in db
        const updatedSubSection = await SubSection.findByIdAndUpdate(
            subSectionId,
            {
                title,
                timeDuration,
                description,
                ...(vedioUrl && { vedioUrl })
            },
            { new: true }
        );

        if (!updatedSubSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }

        // ret res
        return res.status(200).json({
            success: true,
            message: "SubSection updated successfully",
            updatedSubSection,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error while updating SubSection",
            error: error.message,
        });
    }
};

// delete subSection
exports.deleteSubSection = async (req, res) => {
    try {
        // fetch data
        const { subSectionId, sectionId } = req.body;

        // Validate
        const subSection = await SubSection.findById(subSectionId);
        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }

        // remove subsection from section
        await Section.findByIdAndUpdate(
            sectionId,
            { $pull: { SubSection: subSectionId } },
            { new: true }
        );

        // del subSection
        await SubSection.findByIdAndDelete(subSectionId);

        // ret resp
        return res.status(200).json({
            success: true,
            message: "SubSection deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error while deleting SubSection",
            error: error.message,
        });
    }
};
