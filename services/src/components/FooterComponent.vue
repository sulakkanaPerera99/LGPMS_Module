<template>
    <div class="footer">
   

        <div class="bottom" @click="scrollToTop()">
            <a>copyright@State Ministry Of Provincial Councils And Local Government Affairs</a>
<!-- 
            <div class="share">
                <a href="https://www.facebook.com/" class="fab fa-facebook-f"></a>
                <a href="https://twitter.com/?lang=en" class="fab fa-twitter"></a>
                <a href="https://www.instagram.com/" class="fab fa-instagram"></a>
                <a href="https://www.pinterest.com/" class="fab fa-pinterest"></a>
            </div> -->

        </div>

    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'FooterComponent',

    computed: {
        ...mapState(['user'])
    },

    methods: {
        scrollToTop() {
            window.scrollTo(0, 0);
        }
    }
}
</script>

<style scoped>
/* footer */
.footer {
    background: #550202;
    padding: 2rem 9%;
    height: auto;
    width: 100%;
    margin-top: auto;
}


.footer .news-letter form {
    max-width: 70rem;
    margin: 1rem auto;
    max-width: 70rem;

    display: flex;
    border-radius: .5rem;
    overflow: hidden;
}

.footer .box-container .box a i {
    padding-right: .5rem;
    color: #620a0a;
}

.footer .bottom {
    /* padding-top: 1rem; */
    text-align: center;
}

.footer .bottom .share {
    margin: 1.5rem 0;
}

.footer .bottom  a {
    /* height: 4.5rem;
    width: 4.5rem;
    line-height: 4.5rem;
    font-size: 2rem;
    border-radius: .5rem;
    margin: 0 .3rem; */
    color: #fff;
    /* background: #620a0a; */
}

.footer .bottom .share a:hover {
    background: #130f40;
}

@media (max-width: 576px) {
    .footer .box-container {

        grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));

    }

}
</style>