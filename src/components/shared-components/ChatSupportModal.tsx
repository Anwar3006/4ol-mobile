import React, {useEffect, useState} from 'react';
import {
    View,
    Modal,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { RadioButton } from 'react-native-paper';
import { themeColors } from '../../theme/colors';
import { moderateScale, verticalScale, horizontalScale } from '../../utils/metrics';
import Icon from 'react-native-vector-icons/Entypo';
import { useSelector } from 'react-redux';
import { user } from '../../store/selectors';
import moment from 'moment';
import { sendMessage } from '../../services/chatsupport';
import { fontSize } from '../../responsive/index';
import { ValidateChatSupport } from '../../validation/index';
import { useFormik } from 'formik';

interface ChatModalProps {
    visible: boolean,
    togglemodal: () => void,
}
export const ChatModal:React.FC<ChatModalProps> = ({visible, togglemodal}) => {
  const userData: any = useSelector(user);
    const [loading, setLoading] = useState(false);

    const formik = useFormik({
      initialValues: {
        name: '',
        message: '',
        selectedOption: '',
      },
      validationSchema: ValidateChatSupport,
      onSubmit: async (values) => {
        const messageToSend = {
          status: 'Open',
          priority: 'Low',
          message: values.message,
          subject: values.selectedOption,
          user_name: values.name,
          requested_by: userData?.id,
          created_at: moment(new Date()).valueOf(),
          updated_at: moment(new Date()).valueOf(),
          created_by: userData?.id,
          updated_by: userData?.id,
          is_created_by_admin_panel: false,
        };
  
        setLoading(true);
        await sendMessage(
          messageToSend,
          () => setLoading(true),
          (successData: any) => {
            setLoading(false);
            formik.resetForm();
            togglemodal();
            console.log('Message sent successfully:', successData);
          },
          (error) => {
            setLoading(false);
            console.error('Error sending message:', error);
            Alert.alert('Error', 'Failed to send your message. Please try again.');
          }
        );
      },
    });
  
    return (
      <Modal
      animationType='slide'
      visible={visible}
      onRequestClose={togglemodal}
      transparent={true}
      >
        <View style={[styles.modalBackground]}>
          <View style={[styles.modalContainer,{backgroundColor: themeColors.white}]}>
            <View style={[styles.modalHeader,{backgroundColor: themeColors.primary}]}>
              <Text style={[styles.modalHeaderText]}>Chat with us</Text>
              <TouchableOpacity onPress={() => {formik.resetForm(),togglemodal()}}>
                <Icon name='minus' size={25} color={themeColors.white}/>
              </TouchableOpacity>
            </View>
            <ScrollView style={{padding:15}} contentContainerStyle={{paddingBottom:100}}>
              <Text style={{color: themeColors.black}}>Sorry, we aren't online at the moment. Leave a message and we will get back to you</Text>
              <Text style={{marginTop:7,fontSize:fontSize(15),fontWeight:'bold',color: themeColors.black}}>Name</Text>
              <TextInput
              style={[styles.input,{borderColor: formik.errors.name ? 'red': themeColors.darkGray}]}
              value={formik.values.name}
              onChangeText={formik.handleChange('name')}
              onBlur={formik.handleBlur('name')}
              />
              {formik.touched.name && formik.errors.name && (
                <Text style={{fontSize:fontSize(13),color:'red'}}>{formik.errors.name}</Text>
              )}
              <Text style={{marginTop:10,fontSize:fontSize(15),fontWeight:'bold',color: themeColors.black}}>What can we help you with today?</Text>
              <RadioButton.Group
              onValueChange={(value) => formik.setFieldValue('selectedOption',value)}
              value={formik.values.selectedOption}
              >
                {['General question','Feature request','Bug report','My account','Other'].map((option) => (
                  <View style={styles.radioItem} key={option}>
                    <RadioButton value={option} />
                    <Text style={[styles.radioText,{color: themeColors.black}]}>{option}</Text>
                  </View>
                ))}
              </RadioButton.Group>
              {formik.touched.selectedOption && formik.errors.selectedOption && (
                <Text style={{fontSize:fontSize(13),color:'red',marginBottom: moderateScale(10)}}>{formik.errors.selectedOption}</Text>
              )}
              <Text style={{fontSize:fontSize(15),fontWeight:'bold',color: themeColors.black,marginTop:-5,marginBottom:7}}>Message</Text>
              <TextInput
              style={[styles.messageInput,{borderColor: formik.errors.message ? 'red' : themeColors.darkGray}]}
              multiline={true}
              textAlignVertical='top'
              value={formik.values.message}
              onChangeText={formik.handleChange('message')}
              onBlur={formik.handleBlur('message')}
              />
              {formik.touched.message && formik.errors.message && (
                <Text style={{color: 'red',fontSize:fontSize(13)}}>{formik.errors.message}</Text>
              )}
            </ScrollView>
            <View style={[styles.modalBottomView,{backgroundColor: themeColors.white,borderTopColor:'#ccc'}]}>
              <View style={{justifyContent:'flex-end'}}>
                <Text style={{color: themeColors.Supportcolor,fontWeight:'bold',fontSize:fontSize(15),marginLeft:4,marginTop:18}}>4OL Support</Text>
              </View>
              {loading ? (
                <ActivityIndicator size='small' color='green'/>
              ) : (<TouchableOpacity 
              style={{
                alignItems:'center',
                justifyContent:'center',
                height:verticalScale(55),
                width:horizontalScale(155),
                marginHorizontal:15,
                borderRadius:10,
                backgroundColor: themeColors.primary,
              }}
                onPress={() => formik.handleSubmit()}
                >
                  <Text style={{fontSize:fontSize(15),color: themeColors.white}}>Send Message</Text>
                </TouchableOpacity>)}
            </View>
          </View>
        </View>
      </Modal>
    )
}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalContainer: {
        height: verticalScale(600),
        width: horizontalScale(300),
        borderRadius:10,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {width: 0,height: 2},
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
      },
      modalHeader: {
        flexDirection:'row',
        justifyContent: 'space-between',
        height:verticalScale(50),
        width:'100%',
        alignItems:'center',
        paddingHorizontal:10,
        borderTopLeftRadius:10,
        borderTopRightRadius:10
      },
      modalHeaderText: {
        fontSize:fontSize(20),
        fontWeight:'bold',
        textAlign:'center',
        color:'#fff',
        paddingLeft: horizontalScale(70)
      },
      input: {
        borderWidth:1,
        marginTop:10,
        borderRadius:5
      },
      radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      radioText: {
        fontSize: fontSize(18),
      },
      messageInput:{
        borderWidth:1,
        height:verticalScale(155),
        borderRadius:5,
      },
      modalBottomView: {
        flexDirection:'row',
        position:'absolute',
        bottom:0,
        height:verticalScale(90),
        width:'100%',
        borderTopWidth:1,
        borderBottomLeftRadius:10,
        borderBottomRightRadius:10,
        alignItems:'center',
        justifyContent:'space-around',
        shadowColor: "#000",
        shadowOffset: {width: 0,height: 2},
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
      }
})
