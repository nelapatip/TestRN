import React, { Component } from 'react'
import styles from './ContactsDashboardStyle'
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Alert,
    Linking,
    Platform,
    Animated,
    Easing
} from 'react-native'
import Tags from './Tags'
class ExpandableRow extends Component {

    constructor(props) {
        super(props)
       
    }

    componentDidMount() {
    }


    render() {
        return (
            <View style={styles.RowStyle} >

                <TouchableOpacity style={styles.InnerRowStyle} >
                    <Text style={styles.RowTitle}>{this.props.title}</Text>
                    <Tags
                        initialTags={this.props.title}
                        //section={this.props}
                       />
                </TouchableOpacity>
            </View>
        )
    }
}

export default ExpandableRow