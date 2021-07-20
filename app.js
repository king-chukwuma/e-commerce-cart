const client = contentful.createClient({
  space: "d465js3a0u0sn",
  accessToken: "8AzWp42X083VCxO4S5-H4k_Ix84-74klw-SmZ--bobQ",
});

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

let cart = [];
let buttonsDOM = [];

class Products {
  //get all products from database, it is called in the DOMContentLoaded event
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;

        return { title, price, id, image };
      });

      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

class UI {
  // display all items(from the getProducts fn called in DOMContentLoaded event (and returned the products array)) on the homePage i.e image, button,name of item, and price
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `<article class="product">
          <div class="img-container">
            <img
              src=${product.image}
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>${product.price}</h4>
        </article>`;
    });

    // insert all products into HTML
    productsDOM.innerHTML = result;
  }

  getBagButton() {
    // (1) get all the 'add to cart' buttons on all pictures of products on homePage. It'll return a NodeList
    //      but  converted to an array using [] and ...
    // (2) reassigning it to another variable. LAthough there's no need for this
    // (3) reassigning it to another variable. LAthough there's no need for this
    // (4) for each btn, get the id of each btn and set ti "id"
    // (5) find the btn from the existing cart using the 'id' and return the product
    // (6) if it's in the cart, disable the button and change the text

    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);

      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }

      // if it is not in the cart,
      //   (1), change text and disabled
      //   (2), add to the existing cart using the 'cart format'
      //   (3), save to cart and change the values of the total products and total amount
      button.addEventListener("click", (e) => {
        e.target.innerText = "In Cart";
        e.target.disabled = true;
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        cart = [...cart, cartItem];
        Storage.saveCart(cart);
        this.setCartValues(cart);
        this.addCartItem(cartItem);
        // this.showCart();
      });
    });
  }

  setCartValues(cart) {
    //   set the values of total items and total cost and update on DOM
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  addCartItem(item) {
    //   add individual item to the cart page
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src=${item.image} alt=${item.title} />
            <div>
              <h4>${item.title}</h4>
              <h5>${item.price}</h5>
              <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount" data-id=${item.id}>${item.amount}</p>
              <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>`;
    cartContent.appendChild(div);
  }

  showCart() {
    // show cart page
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  setupAPP() {
    // (1) Get cart from local Strorage and set the total values
    // (2) add items to cart page
    // (3) show cart when cart icon clicked and remove cart page when cancel icon clicked
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populate(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }

  populate(cart) {
    //add items to cart one at a time
    cart.forEach((item) => this.addCartItem(item));
  }

  hideCart() {
    //remove cart page
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  cartLogic() {
    //Set what clear button does
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    }); //Set what clear button does {END!!!}

    //Check which button is clicked
    cartContent.addEventListener("click", (e) => {
      //if it's the 'remove' button
      if (e.target.classList.contains("remove-item")) {
        let removeItem = e.target;
        let id = removeItem.dataset.id;
        this.removeItem(id);
        cartContent.removeChild(removeItem.parentElement.parentElement);
        if (cartContent.children.length === 0) {
          this.hideCart();
        }
      } //if it's the 'remove' button {END!!!}

      //if it's the 'up-button'
      else if (e.target.classList.contains("fa-chevron-up")) {
        let targetClicked = e.target; // the i tag
        let idtargetClicked = targetClicked.dataset.id;
        let tempItem = cart.find((item) => item.id === idtargetClicked); //find the item from the cart
        tempItem.amount = tempItem.amount + 1; //increase by 1

        // save the values on the locla storageCart and update DOM
        Storage.saveCart(cart);
        this.setCartValues(cart);
        targetClicked.nextElementSibling.innerText = tempItem.amount;
      } //   if it's the 'up-button' {END!!}

      // if it's the 'down-button'
      else if (e.target.classList.contains("fa-chevron-down")) {
        let targetClicked = e.target;
        let idOftargetClicked = targetClicked.dataset.id;
        let tempItem = cart.find((item) => item.id === idOftargetClicked);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount >= 1) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          targetClicked.previousElementSibling.innerText = tempItem.amount;
        } else {
          tempItem.amount = 1;
          return;
        }
      } // if it's the 'down-button' {END!!}
    });
  }

  clearCart() {
    //create a new array 'cartItems' 'from cart' using 'id' attr
    // remove each product row from the DOM one after the other
    //remove the cart window 'pop-up completely'

    let cartItems = cart.map((item) => item.id);

    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length) {
      cartContent.removeChild(cartContent.children[0]);
    }

    this.hideCart();
  }

  removeItem(id) {
    //filter out i.e remove the selected product row form the list of items in cart and DOM
    cart = cart.filter((item) => item.id !== id);

    //set the new values of total products in cart and total amount and save the new cart state
    this.setCartValues(cart);
    Storage.saveCart(cart);

    //get the item whose "add to cart" button from the picture was clicked; disable it and change text
    let btn = this.getSingleButton(id);
    btn.disabled = false;
    btn.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }

  getSingleButton(id) {
    // get the button that was clicked from an array of the buttons[buttonsDOM] of "add to cart" in pictures
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart(cart) {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  ui.setupAPP();
  ui.cartLogic();

  //get all products
  products
    .getProducts()
    .then((product) => {
      ui.displayProducts(product);
      Storage.saveProducts(product);
    })
    .then(() => {
      ui.getBagButton();
    });
});
