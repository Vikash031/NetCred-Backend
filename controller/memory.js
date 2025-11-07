const User = require('../models/user'); 
const ALLAHABAD_UNIVERSITY_INSTITUTES = [
    "University of Allahabad (Main Campus)",
    "Motilal Nehru National Institute of Technology Allahabad (MNNIT)",
    "Ewing Christian College (ECC)",
    "Allahabad Degree College (ADC)",
    "Chaudhary Mahadeo Prasad Degree College (CMP)",
    "Arya Kanya Degree College",
    "Jagat Taran Girls Degree College",
    "Ishwar Saran Degree College",
    "Hamidia Girls Degree College",
];

/**
 * Controller to fetch unique values for filter dropdowns (Institutes, Batch Years, Courses).
 */
exports.getFilterOptions = async (req, res) => {
    try {
        // Find all users and project only the 'experience' array
        const users = await User.find({}).select('experience');

        const uniqueInstitutes = new Set(ALLAHABAD_UNIVERSITY_INSTITUTES); // Start with seeded list
        const uniqueBatchYears = new Set();
        const uniqueCourses = new Set();

        users.forEach(user => {
            if (user.experience) {
                user.experience.forEach(item => {
                    // Populate Institute list with user-entered data as well
                    if (item.company_name) {
                        uniqueInstitutes.add(item.company_name.trim());
                    }
                    if (item.duration) {
                        uniqueBatchYears.add(item.duration.trim());
                    }
                    if (item.location) {
                        // Assuming 'location' field is being used for the 'course' name
                        uniqueCourses.add(item.location.trim());
                    }
                });
            }
        });

        // Convert Sets to Arrays and sort for better display
        const filterOptions = {
            institutes: Array.from(uniqueInstitutes).sort(),
            batchYears: Array.from(uniqueBatchYears).sort((a, b) => b - a), // Sort years descending
            courses: Array.from(uniqueCourses).sort(),
        };

        return res.status(200).json(filterOptions);

    } catch (error) {
        console.error("Error fetching filter options:", error);
        return res.status(500).json({ error: "Internal server error while fetching filter options." });
    }
};


/**
 * Controller to filter alumni based on selected criteria.
 */
exports.filterAlumni = async (req, res) => {
    try {
        const { selectedInstitute, selectedBatchYear, selectedCourse } = req.body;
        
        // Logical Error Fix: Ensure at least one filter is present, though frontend handles this,
        // it's good practice to have a server-side check.
        if (!selectedInstitute && !selectedBatchYear && !selectedCourse) {
             return res.status(400).json({ error: "Please provide at least one filter criterion." });
        }

        // Build the MongoDB query condition for the experience array
        const experienceQuery = {};

        // MAPPING FIX: company_name maps to Institute, duration maps to Batch Year, location maps to Course.
        if (selectedInstitute) {
            experienceQuery.company_name = selectedInstitute;
        }
        if (selectedBatchYear) {
            experienceQuery.duration = selectedBatchYear;
        }
        if (selectedCourse) {
            experienceQuery.location = selectedCourse;
        }

        const alumni = await User.find({
            experience: {
                $elemMatch: experienceQuery
            }
        }).select('_id f_name headline curr_location profilePic experience'); // Select necessary fields

        // Format the output to clearly include the matching academic info
        const formattedAlumni = alumni.map(user => {
            // Find the *first* academic record that matches the search criteria (for display purposes)
            const academicInfo = user.experience.find(item => {
                let match = true;
                if (selectedInstitute && item.company_name !== selectedInstitute) match = false;
                if (selectedBatchYear && item.duration !== selectedBatchYear) match = false;
                if (selectedCourse && item.location !== selectedCourse) match = false;
                return match;
            });
            
            return {
                _id: user._id,
                f_name: user.f_name,
                headline: user.headline,
                curr_location: user.curr_location,
                profilePic: user.profilePic,
                // Map the *matching* academic info for the card display
                academicInfo: academicInfo ? { 
                    institute: academicInfo.company_name, 
                    batchYear: academicInfo.duration, 
                    course: academicInfo.location,
                    role: academicInfo.designation,
                } : null, // Should not be null if the user was found by the query
            };
        });

        return res.status(200).json({ alumni: formattedAlumni });

    } catch (error) {
        console.error("Error filtering alumni:", error);
        return res.status(500).json({ error: "Internal server error during filtering." });
    }
};


exports.getAcademicInfo = async (req, res) => {
  try {
    
    const userId = req.query.userId || req.user?._id;

    if (!userId) {
      return res.status(200).json({
        academicInfo: [],
        userName: null
      });
    }

    const user = await User.findById(userId).select('experience f_name');

    if (!user) {
      // Not found -> return safe empty response instead of 404 to avoid frontend failures
      return res.status(200).json({
        academicInfo: [],
        userName: null
      });
    }

    const academicInfo = (user.experience || []).map(item => ({
      _id: item._id,
      role: item.designation,
      institute: item.company_name,
      batchYear: item.duration,
      course: item.location,
    }));

    return res.status(200).json({
      academicInfo,
      userName: user.f_name
    });

  } catch (error) {
    console.error("Error fetching academic info for memories:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
