import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground, 
  ActivityIndicator, 
  Alert, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

// ✅ ඔයාගේ IP එක මෙතනට දාන්න (Backend එකේ /api prefix එක තියෙනවා නම් අගට /api එකතු කරන්න)
// Vue code එකේ axios.get('/hashpass/...') තිබුන නිසා මම හිතනවා /api නැතුව ඇති කියලා.
// එහෙම නැත්නම්: 'http://10.10.35.59:3000/api' ලෙස වෙනස් කරන්න.
const API_BASE_URL = 'http://10.10.35.59:3000/api'; 

export default function LoginScreen() {
  const router = useRouter();
  const [nic, setNic] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // --- 1. NIC Padding Logic (Vue Code එකෙන් ගත්තේ) ---
  const addZero = (num) => {
    num = num.toString();
    // Example: 971234567V -> 199712345670
    return '19' + num.slice(0, 5) + '0' + num.slice(5, -1);
  };

  const addZeroPadding = () => {
    // Check old NIC format (9 digits + V/X)
    if (nic && nic.length === 10 && (nic.charAt(9).toUpperCase() === 'V' || nic.charAt(9).toUpperCase() === 'X')) {
       return addZero(nic);
    }
    // දැනටමත් ඉලක්කම් 12 නම් හෝ වෙනත් නම් එලෙසම යවන්න
    return nic;
  };

  // --- 2. Handle Login ---
  const handleLogin = async () => {
    setErrorMsg(''); // Reset errors

    // Validation
    if (!nic) {
      setErrorMsg("Entering a NIC is required");
      return;
    }
    // Vue එකේ Validation: Length 12 නොවේ නම් සහ අගට V/X නැත්නම් Error
    const isOldNic = nic.length === 10 && (nic.toUpperCase().endsWith('V') || nic.toUpperCase().endsWith('X'));
    const isNewNic = nic.length === 12 && !isNaN(nic);

    if (!isOldNic && !isNewNic) {
      setErrorMsg("NIC must be valid");
      return;
    }

    if (!password) {
      setErrorMsg("Password is required");
      return;
    }

    setLoading(true);

    try {
      // 1. NIC එක Format කරගැනීම (Vue Logic: addZeroPadding)
      const formattedNic = addZeroPadding();
      
      console.log(`Checking User: ${formattedNic}`);

      // 2. API Call (Vue එකේ විදියටම)
      const response = await axios.get(`${API_BASE_URL}/hashpass/${formattedNic}/${password}`);
      const matchUser = response.data;

      // 3. Response Check
      if (matchUser === 'error') {
        setErrorMsg("Incorrect password!");
      } else if (matchUser === 'not') {
        setErrorMsg("User not Found!");
      } else {
        // User Found
        
        // 4. Status Check
        if (matchUser.emp_status == 0) {
          setErrorMsg("You are inactive");
        } else {
          // 5. User Level Check (Level 5 or 7)
          if (matchUser.user_level == 10 || matchUser.user_level == 5) {
            
            // --- Save Data (Vue: sessionStorage -> React Native: AsyncStorage) ---
            const userData = {
              nic: matchUser.emp_nic,
              sabha: matchUser.emp_prs_code,
              userLevel: matchUser.user_level,
              userName: matchUser.emp_name,
              procode: matchUser.emp_pro_code
            };
            await AsyncStorage.setItem('userData', JSON.stringify(userData));

            // --- Fetch Property Data (Optional) ---
            if (matchUser.emp_pro_code) {
               try {
                 const proRes = await axios.get(`${API_BASE_URL}/probyid/${matchUser.emp_pro_code}`);
                 if (proRes.data && proRes.data.length > 0) {
                    const proDataObj = {
                      pr: matchUser.emp_pro_code,
                      prname: proRes.data[0].pro_name
                    };
                    await AsyncStorage.setItem('prodata', JSON.stringify(proDataObj));
                 }
               } catch (e) {
                 console.log("Property fetch error:", e);
               }
            }

            // --- Redirect ---
            // Vue එකේ Dashboard දෙකක් තිබුනට, Mobile App එකේ දැනට අපි හදලා තියෙන්නේ Reading Page එක විතරයි.
            // ඒ නිසා කවුරු ආවත් Reading Page එකට යවමු.
            Alert.alert("Success", `Welcome ${matchUser.emp_name}!`);
            router.replace('/reading'); 

          } else {
            setErrorMsg("Access Denied. Only Officers can use this App.");
          }
        }
      }

    } catch (error) {
      console.error("Login API Error:", error);
      setErrorMsg("Connection Failed. Check IP or Internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      // ඔයාගේ Vue App එකේ තිබුන Background Image එකට සමාන පින්තූරයක්
      source={{ uri: 'https://i.imgur.com/6X1Q6vN.jpeg' }} 
      style={styles.backgroundImage}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.loginBox}>
          {/* Heading Section */}
          <View style={styles.heading}>
            <Text style={styles.mainTitle}>Local Government Payment Management System</Text>
            <Text style={styles.subTitle}>LGPMS LOGIN</Text>
          </View>

          {/* Error Message */}
          {errorMsg ? (
            <View style={styles.errorBox}>
               <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Input Fields */}
          <TextInput
            style={styles.input}
            placeholder="Enter your NIC"
            placeholderTextColor="#666"
            value={nic}
            onChangeText={setNic}
            autoCapitalize="characters" // V/X සඳහා Capital කිරීම
          />

          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {/* Login Button */}
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>LOGIN NOW</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: "center",
    alignItems: 'center'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  loginBox: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 249, 250, 0.9)', // #fff9faa8 (Vue style)
    padding: 25,
    borderRadius: 5, // Vue එකේ border-radius පොඩියි
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)'
  },
  heading: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#58071b', // Vue Primary Color
    textAlign: 'center',
    marginBottom: 5,
  },
  subTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#58071b',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#f7f7f7', // Vue Input Background
    padding: 15,
    borderRadius: 0, // Vue එකේ input border-radius නෑ වගේ
    marginBottom: 15,
    fontSize: 16,
    color: '#130f40',
    borderWidth: 0,
  },
  button: {
    backgroundColor: '#58071b', // Vue Button Color
    padding: 15,
    borderRadius: 0,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textTransform: 'uppercase' // lowercase "login now" -> "LOGIN NOW"
  },
  errorBox: {
    backgroundColor: '#fff9fa',
    borderColor: 'rgba(255, 66, 79, .2)',
    borderWidth: 2,
    padding: 10,
    marginBottom: 15,
    borderRadius: 2
  },
  errorText: {
    color: 'rgb(182, 0, 0)',
    fontSize: 14,
    textAlign: 'center'
  }
});