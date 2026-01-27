<template>
  <div>
    <div class="product">
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCpAvaNWvvf7c15lsTVbAqx0D2kM6xgNwViA&usqp=CAU" alt="Product Name" />
      <h2>Air Jordan 1 Mid SE</h2>
      <p>
        The Air Jordan 1 Mid SE maintains the timeless appeal of the first AJ1 and renews it with new colors to give it an updated profile. They feature a lightweight Air-Sole unit and a combination of natural and synthetic materials that complete their classic look.
      </p>
    </div>

    <h1>Product Reviews</h1>
    <div v-for="review in reviews" :key="review.id" class="review-container">
      <ReviewComponent :reviewContent="review.content" />
    </div>
  </div>
</template>


<script>
import ReviewComponent from './Review.vue';
const ReviewListComponent = {
  components: {
    ReviewComponent
  },
  data() {
    return {
      reviews: [
        { id: 1, content: '<p>This is a <strong>great</strong> product!</p>' },
        { id: 2, content: '<p>I love this product!' },
        { id: 3, content: '<p>Amazing quality! <em>Highly recommended.</em></p>' },
        { id: 4, content: '<p>Not what I expected.</p>' },
        { id: 5, content: '<p><a href="http://example.com">Check this out!</a></p>' },
      ]
    };
  },
};
export default ReviewListComponent
</script>
<style >
.product {
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  row-gap: 12px;
}
.product img {
  width: 300px; /* Adjust as needed */
  height: auto;
  margin: 0 auto;
  text-align: center;
}
.product {
  border-bottom: 1px solid #ccc;
  margin-bottom: 20px;
  padding-bottom: 20px;
}
h2, h1 {
  margin-top: 0;
  text-align: center;
}
.review-container {
  border: 1px solid #eee;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  max-width: 200px;
  margin: 0 auto;
  margin-bottom: 20px;
  background-color: #f9f9f9;
}
.review-container p {
  margin: 0;
  color: #000;
}
.review-container strong {
  color: #4CAF50; /* A green color for positive emphasis */
}
.review-container em {
  color: #F44336; /* A red color for negative emphasis */
}
</style>
