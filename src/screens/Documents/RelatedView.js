import React from 'react'
import {
    Text,
    View,
    Animated,
    Dimensions,
    FlatList,
    StyleSheet,
    TouchableOpacity,
} from 'react-native'
import TabBar from '../../utils/TabBar'
import { COLOR } from '../../constants/Colors'
import fonts from '../../utils/CortellisFonts'
import { Normalize, NormalizeLayout } from '../../utils/Scale'
 
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window')

class RelatedView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            citedBy: this.props.citedBy ? this.props.citedBy : "",
            citedDocuments: this.props.citedDocuments ? this.props.citedDocuments : "",
            textContentDescription: this.props.citedDocuments.Documents ? this.props.citedDocuments.Documents : ""
        }
    }

    renderSeparator = () => {
        return (
            <View style={styles.separatorview}>
            </View>
        );
    };

    render() {
        return (
            <View accessible={false} style={{ height: (this.props.isRelatedViewOpen) ? SCREEN_HEIGHT * 0.4 : 0, width: (this.props.isRelatedViewOpen) ? SCREEN_WIDTH : 0 }}>
                <Animated.View accessible={false} style={{
                    height: '100%',
                    bottom: 0,
                    transform: [{ translateY: this.props.toggleAnimation }]
                }}>
                    <TabBar
                        onTab1Press={() => {
                            this.setState({ textContentDescription: this.state.citedDocuments.Documents })
                        }}
                        onTab2Press={() => {
                            this.setState({ textContentDescription: this.state.citedBy.Documents })
                        }}
                        tab1Text={'Mentioned documents'}
                        tab2Text={'Mentioned by'}
                    />
                    <FlatList
                        data={this.state.textContentDescription}
                        style={styles.flatview}
                        showsVerticalScrollIndicator={false}
                       // ItemSeparatorComponent={this.renderSeparator}
                        ListEmptyComponent={<Text style={{ color: COLOR.GRAY_TEXT, fontSize: Normalize(14), textAlign: 'center', marginTop: NormalizeLayout(25) }}> No documents found.</Text>}
                        renderItem={({ item }) =>
                            <TouchableOpacity onPress={() => { this.props.onDocumentSelection(item.idracNumber) }}>
                                <View style={{ flexDirection: 'row', paddingLeft: NormalizeLayout(20), paddingRight: NormalizeLayout(20), paddingBottom: NormalizeLayout(8), paddingTop: NormalizeLayout(8) }}>
                                    <Text style={styles.descText}>{item.title.replace(/<[^>]*>?/gm, '')} - {item.idracNumber}</Text>
                                </View>
                            </TouchableOpacity>
                        }
                    />
                </Animated.View>

            </View>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 2
    },
    descText: {
        fontSize: Normalize(14),
        fontFamily: fonts.SourceSansProRegular,
        color: COLOR.THEME_COLOR,
    },
    flatview: {

    },
    separatorview: {
        backgroundColor: '#E1E4E6',
        height: 1,
        width: "100%",
    },
});
export default RelatedView ;