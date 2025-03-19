const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
  try {
    // fetch
    const { name, description } = req.body;

    // validate
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required.",
      });
    }

    // add in db
    const CategorysDetails = await Category.create({
      name: name,
      description: description,
    });

    //ret res
    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: CategorysDetails,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create category. Please try again later.",
      error: error.message,
    });
  }
};

exports.showAllCategories = async (req, res) => {
  try {
    // fetch data
    const allCategories = await Category.find({}, { name: 1, description: 1 });

    if (allCategories.length === 0) {
    	return res.status(404).json({
    		success: false,
    		message: "No categories found.",
    	});
    }

    // ret res
    return res.status(200).json({
      success: true,
      message: "Categories retrieved successfully.",
      data: allCategories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve categories. Please try again later.",
      error: error.message,
    });
  }
};

exports.categoryPageDetails = async (req, res) => {
  try {
    // fetch data
    const { categoryId } = req.params;

    // validate
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required.",
      });
    }

    // fetch db
    const selectedCategory = await Category.findById(categoryId)
      .populate("courses")
      .exec();

    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }
    // check courses
    if (selectedCategory.courses.length === 0) {
      console.log("No courses found for the selected category.");
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category.",
      });
    }

    const selectedCourses = selectedCategory.courses;

    // get courses for other categories
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    }).populate("courses");
    let differentCourses = [];
    for (const category of categoriesExceptSelected) {
      differentCourses.push(...category.courses);
    }

    // get top-selling courses across all categories
    const allCategories = await Category.find().populate("courses");
    const allCourses = allCategories.flatMap((category) => category.courses);
    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      message: "Category page details retrieved successfully.",
      selectedCourses,
      differentCourses,
      mostSellingCourses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      error: error.message,
    });
  }
};
