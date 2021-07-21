import React from 'react';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import MUIDialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const useStyles = theme => ({
    text: {
        margin: 0,
    },
});

class Dialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
        };
        this.handleOpen = this.handleOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    handleOpen() {
        this.setState({open: true});
    };

    handleClose() {
        this.setState({open: false});
    };

    render() {
        const { classes } = this.props;

        return (
            <div>
                <MUIDialog
                    open={this.state.open}
                    onClose={this.handleClose}
                    disablePortal
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    disableBackdropClick={this.props.required}
                    disableEscapeKeyDown={this.props.required}
                >
                    <DialogTitle id="alert-dialog-title">{this.props.title}</DialogTitle>
                    <DialogContent dividers>
                        <DialogContentText className={classes.text} id="alert-dialog-description">
                            {this.props.description}
                        </DialogContentText>
                        {this.props.children}
                    </DialogContent>
                    <DialogActions>
                        {this.props.required ? null : (
                            <Button onClick={this.handleClose} color="secondary">
                                {this.props.closeText ? this.props.closeText : 'Close'}
                            </Button>
                        )}
                        {this.props.buttonText ? (
                            <Button onClick={this.props.buttonAction} color="primary">
                                {this.props.buttonText}
                            </Button>
                        ) : null}
                    </DialogActions>
                </MUIDialog>
            </div>
        );
    }
}

Dialog = withStyles(useStyles)(Dialog);

export default async function showDialog(props = {}, children = null) {
    return new Promise(async res => {
        props = Object.assign({
            title: 'Dialog title',
            required: false,
        }, props);
    
        let dialog;
        let id = `dialog${props.layer ? props.layer : 0}`;
        let element = document.getElementById(id);
        if (element == null) {
            element = document.createElement('div');
            element.id = id;
            document.getElementById('dialog').appendChild(element);
        }
        ReactDOM.render((
            <Dialog {...props} ref={element => dialog = element}>
                {children}
            </Dialog>
        ), element);
        /*ReactDOM.render((
            <Dialog {...props} ref={element => dialog = element}>
                {children}
            </Dialog>
        ), element);*/
        
        if (!dialog) //if it didnt work,
            setTimeout(async () => res(await showDialog(props, children)), 100); //try it again with a delay (yes i know i shouldnt but shut up it works)
        else {
            dialog.handleOpen();
            res(dialog);
        }
    });
}