const productModal = document.getElementById('productModal')

productModal.addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget;

    const title = button.getAttribute('data-bs-title');
    const image = button.getAttribute('data-bs-image');
    const description = button.getAttribute('data-bs-description');

    const modalTitle = productModal.querySelector('#productTitle');
    const modalImage = productModal.querySelector('#productModalImage');
    const modalDescription = productModal.querySelector('#productModalDescription');

    modalTitle.textContent = title;
    modalImage.src = image;
    modalDescription.textContent = description;
});