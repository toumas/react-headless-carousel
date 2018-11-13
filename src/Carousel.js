import React from 'react';
import PropTypes from 'prop-types';

const Context = React.createContext();

class Carousel extends React.Component {
    constructor (props) {
        super(props);
        const slideCount = React.Children
            .map(props.children, (C, i) => {
                if (C.type === Slide) {
                    return React.cloneElement(C, {key: i, index: i});
                }
            })
            .filter(C => React.isValidElement(C)).length;
        const setActiveSlideIndex = index => {
            this.intervalId = clearInterval(this.intervalId);
            this.internalSetState(
                prevState => {
                    return {
                        activeSlideIndex: this.getNextSlideIndex(
                            index,
                            prevState.activeSlideIndex,
                            slideCount,
                            props.loop,
                        ),
                    };
                },
                () => {
                    this.initInterval();
                    this.onSlideChange();
                },
            );
        };
        const stop = () => {
            const {isPlaying} = this.state;
            if (isPlaying) {
                this.intervalId = clearInterval(this.intervalId);
                this.internalSetState({isPlaying: false});
            }
        };
        const play = () => {
            const {isPlaying} = this.state;
            if (!isPlaying) {
                this.internalSetState({isPlaying: true}, () => {
                    this.initInterval();
                });
            }
        };

        this.state = {
            slideCount,
            setActiveSlideIndex,
            stop,
            play,
            isPlaying: props.autoplay,
            autoplay: props.autoplay,
            interval: props.interval,
            direction: props.direction,
            loop: props.loop,
            onSlideChange: props.onSlideChange,
            activeSlideIndex: 0,
        };
    }

    componentDidMount () {
        const {autoplay, slideCount} = this.state;
        if (autoplay && slideCount >= 2) {
            this.initInterval();
        }
    }

    componentWillUnmount () {
        this.intervalId = clearInterval(this.intervalId);
    }

    // God bless Kent C. Dodds
    internalSetState (changes, callback) {
        this.setState((state, props) => {
            const stateToSet = [changes]
                .map(c => (typeof c === 'function' ? c(state, props) : c))
                .map(
                    c =>
                        props.stateReducer ? props.stateReducer(state, c) : c,
                )
                .map(({type: ignoredType, ...c}) => c)[0];
            return stateToSet;
        }, callback);
    }

    onSlideChange = () => {
        const {onSlideChange} = this.state;
        if (onSlideChange) {
            const {activeSlideIndex} = this.state;
            onSlideChange(activeSlideIndex);
        }
    };
    // Sorry, I'm bad at computer science, Ryan
    getNextSlideIndex = (index, prevIndex, slideCount, loop) => {
        if (index > slideCount - 1 && loop) {
            return 0;
        }
        if (index < 0) {
            return slideCount - 1;
        }
        if (index >= 0 && index < slideCount) {
            return index;
        }
        return prevIndex;
    };

    initInterval = () => {
        const {interval} = this.state;
        if (!this.intervalId) {
            this.intervalId = setInterval(this.goToNextSlide, interval);
        }
    };

    goToNextSlide = () => {
        const {isPlaying} = this.state;
        if (isPlaying) {
            this.internalSetState(
                prevState => {
                    const {
                        slideCount,
                        activeSlideIndex,
                        direction,
                        loop,
                    } = this.state;
                    const nextIndex = this.getNextSlideIndex(
                        activeSlideIndex + direction,
                        prevState.activeSlideIndex,
                        slideCount,
                        loop,
                    );
                    return {
                        activeSlideIndex: nextIndex,
                        isPlaying: nextIndex !== prevState.activeSlideIndex,
                    };
                },
                () => {
                    this.onSlideChange();
                },
            );
        }
    };

    renderChildren = children => {
        let slideIndex = 0;
        return React.Children.map(children, (C, i) => {
            if (C.type === Slide) {
                const clone = React.cloneElement(C, {
                    key: i,
                    index: slideIndex,
                });
                slideIndex += 1;
                return clone;
            }
            return C;
        });
    };

    render () {
        const {children, as: Component, ...props} = this.props;

        if (Component) {
            return (
                <Context.Provider value={this.state}>
                    <Component {...props}>
                        {typeof children === 'function' ? (
                            children
                        ) : (
                            this.renderChildren(children)
                        )}
                    </Component>
                </Context.Provider>
            );
        }
        return (
            <Context.Provider value={this.state}>
                {this.renderChildren(children)}
            </Context.Provider>
        );
    }
}

Carousel.defaultProps = {
    autoplay: true,
    interval: 2500,
    direction: 1,
    loop: true,
    onSlideChange: null,
};

Carousel.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
        ),
        PropTypes.func,
    ]).isRequired,
    autoplay: PropTypes.bool,
    interval: PropTypes.number,
    direction: PropTypes.number,
    loop: PropTypes.bool,
    onSlideChange: PropTypes.func,
};

const Slide = ({index, children, as: Component, ...props}) => {
    return (
        <Context.Consumer>
            {({activeSlideIndex}) => {
                if (index === activeSlideIndex) {
                    if (Component) {
                        return (
                            <Component {...props}>
                                {typeof children === 'function' ? (
                                    children
                                ) : (
                                    children
                                )}
                            </Component>
                        );
                    }
                    return children;
                }
                return null;
            }}
        </Context.Consumer>
    );
};

Slide.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.func,
        PropTypes.string,
    ]),
};

const Control = ({children}) => {
    return (
        <Context.Consumer>
            {props => {
                return children({...props});
            }}
        </Context.Consumer>
    );
};

Control.propTypes = {
    children: PropTypes.func.isRequired,
};

export default Carousel;
export {Slide, Control};
