import React from 'react';
import { ScrollView, StyleSheet, Text, View, Button } from 'react-native';

import { InitializeDB, CloseDB } from "../actions/OfflineActions";
import { connect } from "react-redux";


class SettingsScreen extends React.Component {
    // static navigationOptions = {
    //     title: 'Offline Demo',
    // };

    constructor(props) {
        super(props);
        this.state = {
            
            loading: true
        };
        
    }

    render() {
        return (
            <ScrollView style={styles.container}>
            <Text style={{fontSize: 24, textAlign: 'center'}}>{this.props.msg}</Text>
                <Button
                    onPress={ () => {this.props.action1()}}
                    title="Initialize"
                    color="#841584"
                    accessibilityLabel="Learn more about this purple button"
                />
                <Button
                    onPress={ () => {this.props.action2(this.props.db)}}
                    title="CloseDB"
                    color="#841584"
                    accessibilityLabel="Learn more about this purple button"
                />    
            </ScrollView>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 15,
        backgroundColor: '#fff',
    },
});


const mapStateToProps = state => ({
    msg: state.offlineReducer.msg,
    db: state.offlineReducer.db
});


const mapDispatchToProps = dispatch => ({
    action1: () => dispatch(InitializeDB()),
    action2: (db) => dispatch(CloseDB(db)),

});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen);

