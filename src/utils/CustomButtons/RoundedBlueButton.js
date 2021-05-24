import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Text } from 'react-native'
// import { COLOR } from '../../constants/Colors'
import { Normalize, NormalizeLayout } from '../../utils/Scale'


export default class RoundedBlueButton extends Component {
    static propTypes = {
        onStatusChange: PropTypes.func,
    }

    constructor(props) {
        super(props)
       
        // this.onPress = this.onPress.bind(this)
    }

    onPress() {
        { this.props.onStatusChange(!this.props.pressStatus) }
    }

    render() {
        return (
            <View style={styles.container}>
                {!this.props.pressStatus  && (
                    <TouchableOpacity accessibilityLabel='reusable_roundedbutton_event'
                    style={[this.props.blueButtonStyle]}
                    onPress={this.props.onPress}
                >
                    <Text style={this.props.pressStatus ? styles.textWhite : [styles.textStyle, this.props.textStyle]}> {this.props.text} </Text>
                </TouchableOpacity>
                )}

                {this.props.pressStatus && !this.props.deSelectionSupported && (    
                    <View accessibilityLabel='reusable_roundedbutton_event'
                    style={[styles.buttonPress, this.props.buttonStyle]}
                    onPress={this.props.onPress} >            
                     <Text style={this.props.pressStatus ? styles.textWhite : [styles.textStyle, this.props.textStyle]}> {this.props.text} </Text>
                    </View>
                )}
                 {this.props.pressStatus && this.props.deSelectionSupported && (    
                    <TouchableOpacity accessibilityLabel='reusable_roundedbutton_event'
                    style={[styles.buttonPress, this.props.buttonStyle]}
                    onPress={this.props.onPress} >            
                     <Text style={this.props.pressStatus ? styles.textWhite : [styles.textStyle, this.props.textStyle]}> {this.props.text} </Text>
                    </TouchableOpacity>
                )}
                
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    
})