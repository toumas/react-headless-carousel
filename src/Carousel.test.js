import 'jest-dom/extend-expect';
import React from 'react';
import {
    render,
    cleanup,
    waitForElement,
    fireEvent,
} from 'react-testing-library';

import Carousel, {Slide, Control} from './Carousel';

afterEach(cleanup);

jest.useFakeTimers();

describe('Carousel', () => {
    it('renders children', () => {
        const {getByText} = render(
            <Carousel>
                <div>foo</div>
            </Carousel>,
        );
        expect(getByText(/^foo/)).toHaveTextContent('foo');
    });
    it('cycles between slides', () => {
        const {getByText} = render(
            <Carousel>
                <Slide>
                    <div>foo</div>
                </Slide>
                <Slide>
                    <div>bar</div>
                </Slide>
            </Carousel>,
        );
        jest.runOnlyPendingTimers();
        expect(getByText(/^bar/)).toHaveTextContent('bar');
        jest.runOnlyPendingTimers();
        expect(getByText(/^foo/)).toHaveTextContent('foo');
    });
    it('shows next slide when next is clicked', () => {
        const {getByText} = render(
            <Carousel>
                <Slide>
                    <div>foo</div>
                </Slide>
                <Slide>
                    <div>bar</div>
                </Slide>
                <Control>
                    {({setActiveSlideIndex, activeSlideIndex}) => (
                        <button
                            onClick={() =>
                                setActiveSlideIndex(++activeSlideIndex)}
                        >
                            next
                        </button>
                    )}
                </Control>
            </Carousel>,
        );
        fireEvent.click(getByText('next'));
        expect(getByText(/^bar/)).toHaveTextContent('bar');
    });
    it('shows previous slide when previous is clicked', () => {
        const {getByText} = render(
            <Carousel>
                <Slide>
                    <div>foo</div>
                </Slide>
                <Slide>
                    <div>bar</div>
                </Slide>
                <Control>
                    {({setActiveSlideIndex, activeSlideIndex}) => (
                        <button
                            onClick={() =>
                                setActiveSlideIndex(--activeSlideIndex)}
                        >
                            previous
                        </button>
                    )}
                </Control>
            </Carousel>,
        );
        fireEvent.click(getByText('previous'));
        expect(getByText(/^bar/)).toHaveTextContent('bar');
    });
    it('stops playing when stop is pressed', () => {
        const {getByText} = render(
            <Carousel>
                <Slide>
                    <div>foo</div>
                </Slide>
                <Slide>
                    <div>bar</div>
                </Slide>
                <Control>
                    {({stop}) => <button onClick={() => stop()}>stop</button>}
                </Control>
            </Carousel>,
        );
        jest.runOnlyPendingTimers();
        expect(getByText(/^bar/)).toHaveTextContent('bar');
        fireEvent.click(getByText('stop'));
        // testing branching
        fireEvent.click(getByText('stop'));
        jest.runOnlyPendingTimers();
        expect(getByText(/^bar/)).toHaveTextContent('bar');
    });
    it('starts playing when play is pressed', () => {
        const {getByText} = render(
            <Carousel autoplay={false}>
                <Slide>
                    <div>foo</div>
                </Slide>
                <Slide>
                    <div>bar</div>
                </Slide>
                <Control>
                    {({play}) => <button onClick={() => play()}>play</button>}
                </Control>
            </Carousel>,
        );
        fireEvent.click(getByText('play'));
        // testing branching
        fireEvent.click(getByText('play'));
        jest.runOnlyPendingTimers();
        expect(getByText(/^bar/)).toHaveTextContent('bar');
    });
    it('invokes onChange callback', () => {
        const onSlideChange = jest.fn();
        render(
            <Carousel onSlideChange={onSlideChange}>
                <Slide>
                    <div>foo</div>
                </Slide>
                <Slide>
                    <div>bar</div>
                </Slide>
            </Carousel>,
        );
        jest.runOnlyPendingTimers();
        expect(onSlideChange).toHaveBeenCalledTimes(1);
    });
    it('does not loop if loop is false', () => {
        const {getByText} = render(
            <Carousel loop={false}>
                <Slide>
                    <div>foo</div>
                </Slide>
                <Slide>
                    <div>bar</div>
                </Slide>
            </Carousel>,
        );
        jest.runOnlyPendingTimers();
        expect(getByText(/^bar/)).toHaveTextContent('bar');
        jest.runOnlyPendingTimers();
        expect(getByText(/^bar/)).toHaveTextContent('bar');
    });
    it('invokes stateReducer callback', () => {
        const stateReducer = jest.fn((state, changes) => ({...changes}));
        render(
            <Carousel stateReducer={stateReducer}>
                <Slide>
                    <div>foo</div>
                </Slide>
                <Slide>
                    <div>bar</div>
                </Slide>
            </Carousel>,
        );
        jest.runOnlyPendingTimers();
        expect(stateReducer).toHaveBeenCalledTimes(1);
    });
});

describe('slide', () => {
    it('renders children', () => {
        const {getByText} = render(
            <Carousel>
                <Slide>
                    <div>foo</div>
                </Slide>
            </Carousel>,
        );
        expect(getByText(/^foo/)).toHaveTextContent('foo');
    });
});

describe('control', () => {
    it('renders children', () => {
        const {getByText} = render(
            <Carousel>
                <Control>{() => <div>foo</div>}</Control>
            </Carousel>,
        );
        expect(getByText(/^foo/)).toHaveTextContent('foo');
    });
});
