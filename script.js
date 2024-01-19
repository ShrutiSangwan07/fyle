let username = 'johnpapa'; // Specific GitHub username
let perPage = 10;
let currentPage = 1;

function showLoader() {
    $('#loader').show();
}

function hideLoader() {
    $('#loader').hide();
}

function displayUserInformation(user) {
    $('#profile-pic').attr('src', user.avatar_url);
    $('#user-bio').text(user.bio || 'No bio available.');

    // Display additional user details and links
    const userLinksContainer = $('#user-links');
    userLinksContainer.empty();
    userLinksContainer.append(`<p><strong>Public Repositories:</strong> <a href="${user.html_url}?tab=repositories" target="_blank">${user.public_repos}</a></p>`);
    userLinksContainer.append(`<p><strong>Public Gists:</strong> <a href="${user.html_url}?tab=gists" target="_blank">${user.public_gists}</a></p>`);
    userLinksContainer.append(`<p><strong>Followers:</strong> <a href="${user.html_url}?tab=followers" target="_blank">${user.followers}</a></p>`);
    userLinksContainer.append(`<p><strong>Following:</strong> <a href="${user.html_url}?tab=following" target="_blank">${user.following}</a></p>`);
}

function displayRepositories(repositories) {
    const repositoriesContainer = $('#repositories');
    repositoriesContainer.empty();

    repositories.forEach(repo => {
        const topics = repo.topics.map(topic => `<span class="badge badge-primary p-2 text-capitalize">${topic}</span>`).join(' ');
        const listItem = `<li class="list-group-item">
                            <h5>${repo.name}</h5>
                            <p>${repo.description}</p>
                            <div>${topics}</div>
                        </li>`;
        repositoriesContainer.append(listItem);
    });
}
function displayPagination(totalPages) {
    const paginationContainer = $('.pagination');
    paginationContainer.empty();

    // Previous button
    paginationContainer.append(`
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="loadPage(${currentPage - 1})" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `);

    // Page links
    for (let i = 1; i <= totalPages; i++) {
        const listItem = `<li class="page-item ${currentPage === i ? 'active' : ''}">
                            <a class="page-link" href="#" onclick="loadPage(${i})">${i}</a>
                          </li>`;
        paginationContainer.append(listItem);
    }

    // Next button
    paginationContainer.append(`
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="loadPage(${currentPage + 1})" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `);
}


function updatePerPage() {
    const newPerPage = parseInt($('#per-page-select').val(), 10);
    perPage = newPerPage;
    loadPage(1); // Reload the first page with the new perPage value
}

function extractTotalPages(linkHeader) {
    const matches = linkHeader.match(/page=(\d+)>; rel="last"/);
    return matches ? parseInt(matches[1], 10) : 1;
}

// Add event listeners
$('#per-page-select').on('change', updatePerPage);



function loadPage(page) {
    showLoader();

    fetch(`https://api.github.com/users/${username}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch user information: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(user => {
            // Display user information
            displayUserInformation(user);
            // Fetch repositories
            fetch(`https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to fetch repositories: ${response.status} ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    hideLoader();
                    displayRepositories(data);
                    currentPage = page;
                    const linkHeader = response.headers.get('link');
                    totalPages = extractTotalPages(linkHeader);

                    displayPagination(totalPages);
                })
                .catch(error => {
                    hideLoader();
                    console.error(`Error fetching repositories: ${error.message}`);
                });
        })
        .catch(error => {
            hideLoader();
            console.error(`Error fetching user information: ${error.message}`);
        });
}
let totalPages = 1; 
loadPage(1); 
