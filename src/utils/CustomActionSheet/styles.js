import { StyleSheet, Platform} from 'react-native'
import { Normalize, NormalizeLayout } from '../Scale'
export const hairlineWidth = StyleSheet.hairlineWidth

export const baseStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.4,
    backgroundColor: '#000',
  },
  wrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    alignSelf: 'flex-end',
    backgroundColor: 'transparent',
    marginHorizontal: NormalizeLayout(10),
    marginBottom: NormalizeLayout(10),
  },

  title: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    borderTopLeftRadius: NormalizeLayout(12),
    borderTopRightRadius: NormalizeLayout(12),
  },
  titleText: {
    color: '#8f8f8f',
    fontSize: Normalize(13),
    fontWeight: '600',
  },
  message: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#f9f9f9',
    borderTopLeftRadius: NormalizeLayout(12),
    borderTopRightRadius: NormalizeLayout(12),
  },
  messageText: {
    color: '#8f8f8f',
    fontSize: Normalize(13),
    textAlign: 'center',
  },

  optionsContainer: {
    borderRadius: NormalizeLayout(12),
  },
  options: {
    backgroundColor: '#cecece',
  },
  buttonContainer: {
    marginTop: hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  buttonTitle: {
    fontSize: Normalize(20),
  },
  cancelButton: {
    borderRadius: NormalizeLayout(12),
  },
  cancelTitle: {
    fontWeight: '600',
  },
  androidHandlingView:{},
})

export const androidStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignSelf: 'flex-end',
    backgroundColor: 'transparent',
    marginBottom: NormalizeLayout(10),
  },

  title: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  message: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    borderTopLeftRadius: NormalizeLayout(12),
    borderTopRightRadius: NormalizeLayout(12),
  },
  optionsContainer: {},
  buttonContainer: {
    marginTop: hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  androidHandlingView:{ 
    overflow: 'hidden',
    borderRadius: NormalizeLayout(12),
    marginHorizontal: NormalizeLayout(10),
  },

  cancelButton: {borderRadius: NormalizeLayout(12),overflow: 'hidden',marginHorizontal: NormalizeLayout(10)} ,
})