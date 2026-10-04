import { useEffect, useState } from "react";
import "./App.css";
import Login from "./LoginForm";

const API_URL = "http://127.0.0.1:3000/api/products";

function App() {
  const [products, setProducts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    product_name: "",
    description: "",
    price: "",
    quantity: "",
  });

  // GET PRODUCTS
  const loadProducts = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadProducts();
    }
  }, [isLoggedIn]);

  // INPUT CHANGE
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ADD / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          product_name: form.product_name,
          description: form.description,
          price: Number(form.price),
          quantity: Number(form.quantity),
        }),
      });

      const result = await response.text();

      console.log("STATUS:", response.status);
      console.log("RESPONSE:", result);

      if (!response.ok) {
        throw new Error(result || "Request failed");
      }

      const wasEditing = editingId !== null;

      setForm({
        product_name: "",
        description: "",
        price: "",
        quantity: "",
      });

      setEditingId(null);
      setShowForm(false);

      await loadProducts();

      alert(
        wasEditing
          ? "Product updated successfully!"
          : "Product added successfully!"
      );
    } catch (error) {
      console.error("API ERROR:", error);
      alert("Failed: " + error.message);
    }
  };

  // EDIT
  const handleEdit = (product) => {
    setForm({
      product_name: product.product_name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
    });

    setEditingId(product.id);
    setShowForm(true);
  };

  // DELETE
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      await loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };

  // SEARCH
  const filteredProducts = products.filter((product) =>
    product.product_name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() => setIsLoggedIn(true)}
      />
    );
  }

  // PRODUCT MANAGEMENT SCREEN
  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Product Management</h1>
          <p>LavaLust Inventory System</p>
        </div>

        <div>
          <button
            className="add-btn"
            onClick={() => {
              setForm({
                product_name: "",
                description: "",
                price: "",
                quantity: "",
              });

              setEditingId(null);
              setShowForm(true);
            }}
          >
            + Add Product
          </button>

          <button
            className="logout-btn"
            onClick={() => setIsLoggedIn(false)}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="card">
        <div className="card-header">
          <h2>Products</h2>

          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {showForm && (
          <form
            className="product-form"
            onSubmit={handleSubmit}
          >
            <h2>
              {editingId ? "Edit Product" : "Add Product"}
            </h2>

            <input
              type="text"
              name="product_name"
              placeholder="Product Name"
              value={form.product_name}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="price"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleChange}
              required
            />

            <div className="form-buttons">
              <button
                type="submit"
                className="save-btn"
              >
                {editingId
                  ? "Update Product"
                  : "Save Product"}
              </button>

              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>

                <td>{product.product_name}</td>

                <td>{product.description}</td>

                <td>
                  ₱{Number(product.price).toLocaleString()}
                </td>

                <td>{product.quantity}</td>

                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      handleDelete(product.id)
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filteredProducts.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center" }}
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;