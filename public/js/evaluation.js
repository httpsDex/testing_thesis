function getEvaluations() {
    let html = "" // Initialize empty HTML string
    const evaluationTableBody = document.getElementById("evaluationTableBody")

    fetch("http://localhost:1804/api/evaluations", { mode: "cors" })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`)
            }
            return response.json()
        })
        .then((data) => {
            console.log(data)

            data.forEach((evaluation) => {
                // Build the HTML for each row
                html += `
                <tr>
                    <td>${evaluation.full_name}</td>
                    <td><input type="number" class="form-control form-control-sm score-input" min="0" max="20" value="${evaluation.teaching_competence_score}"></td>
                    <td><input type="number" class="form-control form-control-sm score-input" min="0" max="15" value="${evaluation.effectiveness_in_services_score}"></td>
                    <td><input type="number" class="form-control form-control-sm score-input" min="0" max="13" value="${evaluation.professional_growth_score}"></td>
                    <td><input type="number" class="form-control form-control-sm score-input" min="0" max="2" value="${evaluation.teaching_experience_score}"></td>
                    <td class="total-score">${evaluation.total_points}</td>
                </tr>
                `
            })

            // After loop, update the table body with all rows
            evaluationTableBody.innerHTML = html

        })
        .catch((error) => {
            console.error(error)
            alert("Failed to load evaluations. Please try again later.")
        })
}


// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    getEvaluations()
})  

