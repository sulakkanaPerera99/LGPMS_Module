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
  Platform,
  Dimensions // Screen height එක ගන්න
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const API_BASE_URL = 'http://10.10.35.59:3000/api'; 
const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [nic, setNic] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // --- Logic කොටස (වෙනසක් නෑ) ---
  const addZero = (num) => {
    num = num.toString();
    return '19' + num.slice(0, 5) + '0' + num.slice(5, -1);
  };

  const addZeroPadding = () => {
    if (nic && nic.length === 10 && (nic.charAt(9).toUpperCase() === 'V' || nic.charAt(9).toUpperCase() === 'X')) {
       return addZero(nic);
    }
    return nic;
  };

  const handleLogin = async () => {
    setErrorMsg(''); 

    if (!nic) {
      setErrorMsg("NIC is required");
      return;
    }
    
    const isOldNic = nic.length === 10 && (nic.toUpperCase().endsWith('V') || nic.toUpperCase().endsWith('X'));
    const isNewNic = nic.length === 12 && !isNaN(nic);

    if (!isOldNic && !isNewNic) {
      setErrorMsg("Invalid NIC Format");
      return;
    }

    if (!password) {
      setErrorMsg("Password is required");
      return;
    }

    setLoading(true);

    try {
      const formattedNic = addZeroPadding();
      console.log(`Checking User: ${formattedNic}`);

      const response = await axios.get(`${API_BASE_URL}/hashpass/${formattedNic}/${password}`);
      const matchUser = response.data;

      if (matchUser === 'error') {
        setErrorMsg("Incorrect Password!");
      } else if (matchUser === 'not') {
        setErrorMsg("User not Found!");
      } else {
        if (matchUser.emp_status == 0) {
          setErrorMsg("Account is Inactive");
        } else {
          if (matchUser.user_level == 10 || matchUser.user_level == 5) {
            
            const userData = {
              nic: matchUser.emp_nic,
              sabha: matchUser.emp_prs_code,
              userLevel: matchUser.user_level,
              userName: matchUser.emp_name,
              procode: matchUser.emp_pro_code
            };
            await AsyncStorage.setItem('userData', JSON.stringify(userData));

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

            Alert.alert("Success", `Welcome Back, ${matchUser.emp_name}!`);
            router.replace('/(tabs)/progress'); 

          } else {
            setErrorMsg("Access Denied: Officers Only.");
          }
        }
      }

    } catch (error) {
      console.error("Login API Error:", error);
      setErrorMsg("Connection Error. Please check your internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/images/meter reading.png')} 
      style={styles.backgroundImage}
      imageStyle={{ opacity: 0.8 }} // Image එක ටිකක් Dark කරලා පෙන්නන්න (optional)
    >
      {/* Dark Overlay for better contrast */}
      <View style={styles.overlay} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.loginBox}>
          
          {/* Header Section */}
          <View style={styles.heading}>
            <Text style={styles.mainTitle}>Water Meter Readings</Text>
            <Text style={styles.subTitle}>LGPMS System</Text>
            <View style={styles.separator} />
          </View>

          {/* Error Message */}
          {errorMsg ? (
            <View style={styles.errorBox}>
               <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>NIC Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 971234567V"
              placeholderTextColor="#999"
              value={nic}
              onChangeText={setNic}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin} 
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

        </View>
        
        {/* Footer Text */}
        <Text style={styles.footerText}>© Local Government Department</Text>

      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Image එක උඩින් පොඩි කළු පාට Layer එකක් (Text කියවන්න ලේසි වෙන්න)
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  loginBox: {
    width: '100%',
    maxWidth: 380,
    // ✅ Glassmorphism Effect: Transparency වැඩි කළා
    backgroundColor: 'rgba(255, 255, 255,0.6)', 
    paddingVertical: 40,
    paddingHorizontal: 30,
    // ✅ Corners රවුම් කළා
    borderRadius: 25, 
    // ✅ Shadow (3D Look)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10, // Android Shadow
  },
  heading: {
    alignItems: 'center',
    marginBottom: 30,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#58071b', 
    textAlign: 'center',
    letterSpacing: 1,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  separator: {
    height: 3,
    width: 40,
    backgroundColor: '#58071b',
    marginTop: 15,
    borderRadius: 2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#ffffff',
    padding: 16,
    // ✅ Input Fields රවුම් කළා
    borderRadius: 15, 
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    // Input shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  button: {
    backgroundColor: '#58071b',
    paddingVertical: 18,
    // ✅ Button එක රවුම් කළා
    borderRadius: 15, 
    alignItems: 'center',
    marginTop: 20,
    // Button Shadow
    shadowColor: "#58071b",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  errorBox: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#ef5350',
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center'
  },
  footerText: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 30,
    fontSize: 12,
    fontWeight: '500'
  }
});