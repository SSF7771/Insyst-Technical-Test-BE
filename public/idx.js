const API_URL = "http://localhost:5000/api/products";
let isEditing = false;

// Fetch and Display Products
async function loadProducts() {
  try {
    const response = await fetch(API_URL);
    const result = await response.json();
    const container = document.getElementById("productList");
    container.innerHTML = "";

    result.data.forEach((product) => {
      // Fix image path (replace backslashes for Windows paths)
      // If product.image exists, append it to base URL, else show placeholder
      let imgHtml = "";
      if (product.image) {
        // Ensure clean path
        const cleanPath = product.image
          .replace(/\\/g, "/")
          .replace("uploads/", "");
        imgHtml = `<img src="http://localhost:5000/uploads/${cleanPath}" alt="${product.name}">`;
      } else {
        imgHtml = `<div style="height:150px; background:#eee; display:flex; align-items:center; justify-content:center;">No Image</div>`;
      }

      const card = `
                        <div class="card">
                            ${imgHtml}
                            <h3>${product.name}</h3>
                            <p class="price">Rp ${product.price}</p>
                            <p><small>${product.description || ""}</small></p>
                            <div class="actions">
                                <button class="edit" onclick="editProduct(${
                                  product.id
                                }, '${product.name}', '${
        product.description
      }', ${product.price}, ${product.categoryId})">Edit</button>
                                <button class="delete" onclick="deleteProduct(${
                                  product.id
                                })">Delete</button>
                            </div>
                        </div>
                    `;
      container.innerHTML += card;
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

// Handle Form Submit (Create & Update)
document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("name", document.getElementById("name").value);
  formData.append("description", document.getElementById("description").value);
  formData.append("price", document.getElementById("price").value);
  formData.append("categoryId", document.getElementById("categoryId").value);

  const imageFile = document.getElementById("image").files[0];
  if (imageFile) {
    formData.append("image", imageFile);
  }

  const id = document.getElementById("productId").value;

  try {
    let response;
    if (isEditing) {
      // Update
      response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        body: formData,
      });
    } 
    
    else {
      // Create
      response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });
    }

    if (response.ok) {
      resetForm();
      loadProducts();
      alert(isEditing ? "Updated Successfully!" : "Created Successfully!");
    } 
    
    else {
      const errorData = await response.json();
      alert("Failed: " + (errorData.message || errorData.error)); 
      console.error("Server Error Details:", errorData);
    }

  } catch (error) {
    console.error(error);
  }
});

// Prepare Form for Editing
window.editProduct = (id, name, desc, price, catId) => {
  isEditing = true;
  document.getElementById("formTitle").innerText = "Edit Product";
  document.getElementById("submitBtn").innerText = "Update";
  document.getElementById("cancelBtn").style.display = "inline-block";

  document.getElementById("productId").value = id;
  document.getElementById("name").value = name;
  document.getElementById("description").value = desc !== "null" ? desc : "";
  document.getElementById("price").value = price;
  document.getElementById("categoryId").value = catId;

  // Scroll to top
  window.scrollTo(0, 0);
};

// Confirmation before Delete
window.deleteProduct = async (id) => {
  const confirmed = confirm("Are you sure you want to delete this product?");
  if (confirmed) {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      loadProducts();
      
    } catch (error) {
      console.error(error);
      alert("Failed to delete");
    }
  }
};

function resetForm() {
  isEditing = false;
  document.getElementById("productForm").reset();
  document.getElementById("formTitle").innerText = "Add New Product";
  document.getElementById("submitBtn").innerText = "Save Product";
  document.getElementById("cancelBtn").style.display = "none";
  document.getElementById("productId").value = "";
}

// Initial Load
loadProducts();
