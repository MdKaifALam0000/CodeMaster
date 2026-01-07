const axios = require('axios');


const getlanguageById = (lang) => {
    const language = {
        "c++": 54,
        "java": 62,
        "javascript": 63,
    }

    return language[lang.toLowerCase()];
}


const submitBatch = async (submissions) => {
    // Encode submissions to base64 to handle UTF-8 issues
    const encodedSubmissions = submissions.map(submission => ({
        ...submission,
        source_code: Buffer.from(submission.source_code).toString('base64'),
        stdin: submission.stdin ? Buffer.from(submission.stdin).toString('base64') : '',
        expected_output: submission.expected_output ? Buffer.from(submission.expected_output).toString('base64') : ''
    }));

    const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
            base64_encoded: 'true'
        },
        headers: {
            'x-rapidapi-key': '4e54b5a566msheb626ea8067098dp13706ejsn5fb90cfc8c38',
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: {
            submissions: encodedSubmissions
        }
    };

    async function fetchData() {
        try {
            const response = await axios.request(options);
            return response.data;
        } catch (error) {
            console.error('Judge0 submitBatch error:', error.response?.data || error.message);
            throw error;
        }
    }

    return await fetchData();
}

// Function to wait for a specified time
// This is used to wait for the Judge0 API to process the submissions before fetching the results
const Waiting = async (timer) => {
    return new Promise(resolve => {
        setTimeout(resolve, timer);
    });
}
const submitToken = async (resultToken) => {

    const options = {
        method: 'GET',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
            tokens: resultToken.join(','),
            base64_encoded: 'true',
            fields: '*'
        },
        headers: {
            'x-rapidapi-key': '4e54b5a566msheb626ea8067098dp13706ejsn5fb90cfc8c38',
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
        }
    };

    async function fetchData() {
        try {
            const response = await axios.request(options);
            return response.data;
        } catch (error) {
            console.error('Judge0 submitToken error:', error.response?.data || error.message);
            throw error;
        }
    }

    while (true) {
        const result = await fetchData();

        const isResultObtained = await result.submissions.every((r) => r.status_id > 2);

        if (isResultObtained) {
            // Decode base64 results
            const decodedSubmissions = result.submissions.map(submission => ({
                ...submission,
                stdout: submission.stdout ? Buffer.from(submission.stdout, 'base64').toString('utf-8') : null,
                stderr: submission.stderr ? Buffer.from(submission.stderr, 'base64').toString('utf-8') : null,
                compile_output: submission.compile_output ? Buffer.from(submission.compile_output, 'base64').toString('utf-8') : null,
                message: submission.message ? Buffer.from(submission.message, 'base64').toString('utf-8') : null
            }));
            
            return decodedSubmissions;
        }

        await Waiting(1000);
    }

}

module.exports = { getlanguageById, submitBatch, submitToken };
