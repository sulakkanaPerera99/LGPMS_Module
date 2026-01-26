<template>
  <div class="login-container1-full">
    <div class="login-containerl">
      <div class="login-form-containerl">
        <form id="loginForm" @submit="handleSubmit" novalidate autocomplete="off">
          <div class="heading"><br>
            <b>
              <h2>Local Goverment Payment Management System</h2>
            </b>
            <h3>LGPMS LOGIN</h3>
          </div>

          <div class="form-group">
            <p class="error-mess" v-if="errors.length > 0">{{ errors[0] }}</p>
            
            <input type="nic" id="uNIC" name="uNIC" class="form-control" placeholder="enter your NIC"
              v-model="loginObj.id" />

            <input type="password" id="uPass" name="uPass" class="form-control" placeholder="enter your password"
              v-model="loginObj.pass" />

            <input type="submit" value="login now" class="btn">
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapMutations } from "vuex";
import { mapState } from "vuex";

export default {
  name: 'Logins',

  data() {
    return {
      loginObj: { id: "", pass: "", nic: "" },
      matchUser: undefined,
      errors: [],
      prodata: []
    }
  },
  computed: {
    ...mapState(["user"]),
  },

  methods: {
    ...mapMutations(["setUser"]),

    scrollToTop() {
      window.scrollTo(0, 0);
    },

    addZero(num) {
      num = num.toString();
      return '19' + num.slice(0, 5) + '0' + num.slice(5, -1);
    },

    addZeroPadding: function () {
      // Check if the user input is a valid number format for old NIC
      if (!isNaN(parseInt(this.loginObj.id)) && this.loginObj.id !== null && (this.loginObj.id.charAt(9).toUpperCase() === 'V' || this.loginObj.id.charAt(9).toUpperCase() === 'X')) {
        this.paddedNum = this.addZero(this.loginObj.id);
      } else {
        this.paddedNum = parseInt(this.loginObj.id);
      }
      return this.paddedNum
    },

    async getMatchUser(nic, pass) {
      // Note: Sending password in URL is not secure, consider using POST body
      let data = await axios.get('/hashpass/' + nic + "/" + pass);
      this.matchUser = data.data;
    },

    async handleSubmit(e) {
      e.preventDefault(); // Prevent form submission immediately
      this.errors = [];

      // Validation
      if (!this.loginObj.id) {
        this.errors.push("Entering a nic is required");
      } else {
        if (this.loginObj.id.length !== 12 &&
          !(
            this.loginObj.id.charAt(9).toUpperCase() === 'V' ||
            this.loginObj.id.charAt(9).toLowerCase() === 'v' ||
            this.loginObj.id.charAt(9).toUpperCase() === 'X' ||
            this.loginObj.id.charAt(9).toLowerCase() === 'x'
          )
        ) {
          this.errors.push('NIC must be valid');
        }
      }

      if (!this.loginObj.pass) {
        this.errors.push('Password is required');
      }

      // If there are errors, stop here
      if (this.errors.length > 0) {
        return;
      }

      // If validation passed, proceed with login
      try {
        let Nic12 = this.addZeroPadding();
        await this.getMatchUser(Nic12, this.loginObj.pass);

        if (this.matchUser === 'error') {
          this.errors.push("Incorrect password!");
        } else if (this.matchUser === 'not') {
          this.errors.push("User not Found!");
        } else {
          // User found
          this.setUser(this.matchUser);
          
          if (this.matchUser.emp_status == 0) {
            this.errors.push("You are inactive");
          } else {
            // User is active
            const data = {
              nic: this.matchUser.emp_nic,
              sabha: this.matchUser.emp_prs_code,
              userLevel: this.matchUser.user_level,
              userName: this.matchUser.emp_name,
              procode: this.matchUser.emp_pro_code
            };

            window.sessionStorage.setItem('userData', JSON.stringify(data));

            // Fetch Property Data if exists
            if (this.matchUser?.emp_pro_code) {
              try {
                const response = await axios.get('/probyid/' + this.matchUser.emp_pro_code);
                this.prodata = response.data;

                const proName = Array.isArray(this.prodata) && this.prodata.length > 0
                  ? this.prodata[0].pro_name
                  : null;

                const prodataObj = {
                  pr: this.matchUser.emp_pro_code,
                  prname: proName || '',
                };
                window.sessionStorage.setItem('prodata', JSON.stringify(prodataObj));
                console.log('Property data:', prodataObj);
              } catch (err) {
                console.error('Error loading property:', err);
              }
            }

            // Redirect based on user level
            if (this.matchUser.user_level == 5) {
              this.$router.push("/Dashboard");
            } else if (this.matchUser.user_level == 7) {
              this.$router.push("/officer-dashboard");
            }
          }
        }
      } catch (error) {
        console.error("Login error:", error);
        this.errors.push("An unexpected error occurred.");
      }
    }
  }
}
</script>

<style scoped>
h2 {
  color: #58071b;
}

.login-container1-full {
  background-image: url("../assets/images/login6.jpeg");
  min-height: 100vh;
  background-size: cover;
}

.login-containerl .login-form-containerl {
  height: 70vh;
}

.login-containerl .login-form-containerl form {
  position: absolute;
  top: 50%;
  left: 35%;
  transform: translate(-50%, -50%);
  max-width: 60rem;
  width: 80%;
  box-shadow: 0 1rem 1rem rgba(0, 0, 0, 0.05);
  border: 0.1rem solid rgba(0, 0, 0, 0.2);
  animation: fadeUp .4s linear;
  background-color: #fff9faa8;
}

.login-containerl .login-form-containerl .form-group {
  padding: 0rem;
  margin-top: 0%;
  margin-bottom: 10%;
  font-size: small; /* Fixed: added semicolon */
  max-width: 75%;   /* Fixed: added colon and semicolon */
}

.login-containerl .login-form-containerl form h3 {
  font-size: 2rem;
  font-weight: bolder;
  text-transform: uppercase;
  color: #58071b;
  margin: 0;
}

.login-containerl .login-form-containerl form .form-control {
  margin: 1.2rem 0;
  background: #f7f7f7;
  font-size: 1.5rem;
  color: #130f40;
  text-transform: none;
  width: 100%;
  border: none;
}

.login-containerl .login-form-containerl form .btn {
  width: 100%;
  background: #58071b;
  font-size: 1.5rem;
}

.login-containerl .login-form-containerl form p {
  padding-top: 1rem;
  font-size: 1.5rem;
  color: #666;
  margin: 0;
}

.login-containerl .login-form-containerl form p a {
  color: #58071b
}

.login-containerl .login-form-containerl form p a:hover {
  color: #130f40;
  text-decoration: underline;
}

.login-containerl .login-form-containerl form .error-box {
  background-color: #fff9fa;
  box-sizing: border-box;
  border: 2px solid rgba(255, 66, 79, .2);
  border-radius: 2px;
  font-size: 12px;
  margin-bottom: 20px;
}

.login-containerl .login-form-containerl form .error-box ul {
  list-style-type: none;
  margin: 0;
  padding: 10px 0px;
}

.login-containerl .login-form-containerl form .error-box ul li {
  padding-left: 10px;
  color: rgb(182, 0, 0);
}
</style>