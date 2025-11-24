// Matching Algorithm Logic

/**
 * Matches students to volunteers based on:
 * 1. Availability (Volunteer must be available for the session)
 * 2. History (Prioritize volunteers who have worked with the student before)
 * 3. Load Balancing (Distribute students evenly among available volunteers)
 * 
 * @param {Array} students - List of students needing matching
 * @param {Array} volunteers - List of available volunteers
 * @param {Array} history - Past session records
 * @returns {Object} - Map of studentId -> volunteerId
 */
export const matchStudentsToVolunteers = (students, volunteers, history) => {
    const matches = {};
    const volunteerLoad = {}; // Track how many students each volunteer has

    // Initialize load
    volunteers.forEach(v => volunteerLoad[v.id] = 0);

    // Sort students by "difficulty" or priority if needed (e.g. those with specific needs first)
    // For now, random order is fine, or alphabetical

    students.forEach(student => {
        // 1. Find volunteers who have worked with this student before
        const previousVolunteers = history
            .filter(h => h.student_id === student.id)
            .map(h => h.volunteer_id);

        // Count frequency of each volunteer
        const volunteerFrequency = {};
        previousVolunteers.forEach(vid => {
            volunteerFrequency[vid] = (volunteerFrequency[vid] || 0) + 1;
        });

        // 2. Filter available volunteers
        // (Assumes 'volunteers' array only contains those available for this session)

        // 3. Score each volunteer
        let bestVolunteerId = null;
        let highestScore = -1;

        volunteers.forEach(volunteer => {
            let score = 0;

            // History score: +10 for each past session
            score += (volunteerFrequency[volunteer.id] || 0) * 10;

            // Load balancing: -5 for each student already assigned
            score -= (volunteerLoad[volunteer.id] || 0) * 5;

            // Random tie-breaker
            score += Math.random();

            if (score > highestScore) {
                highestScore = score;
                bestVolunteerId = volunteer.id;
            }
        });

        // Assign
        if (bestVolunteerId) {
            matches[student.id] = bestVolunteerId;
            volunteerLoad[bestVolunteerId]++;
        } else {
            matches[student.id] = null; // No volunteer found (shouldn't happen if volunteers > 0)
        }
    });

    return matches;
};
