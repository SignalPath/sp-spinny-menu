(function() {
    'use strict';

    describe('SpSpinnyController', function() {
        var vm, $controller;
        var $document, $scope, $timeout;

        it('should init current buttons to passed in button array', function() {
            $scope.buttons = [{icon: 'fake'}];
            initController();
            expect(vm.currentButtons).toEqual($scope.buttons);
        });

        describe('document click', function() {
            it('should call close', function() {
                var callback = $document.on.calls.mostRecent().args[1];
                expect($document.on).toHaveBeenCalledWith('click', jasmine.any(Function));
                expect(callback).toBe(vm.close);
            });
        });

        describe('scope destroy', function() {
            it('should stop listening for document click', function() {
                var destroyCallback = $scope.$on.calls.mostRecent().args[1];
                destroyCallback();
                expect($document.off).toHaveBeenCalledWith('click', jasmine.any(Function));
            })
        });

        describe('vm.toggle', function() {
            describe('if children are active', function() {
                it('should reset main button', function() {
                    vm.toggle();
                    expect(vm.childrenActive).toEqual(false);
                    expect(vm.activeButton).toBeUndefined();
                });

                it('should initially set animation state to contracting', function() {
                    $timeout.and.callThrough();
                    vm.toggle();
                    expect(vm.animationState).toEqual('contracting');
                });

                it('should finally set animation state to expanding', function() {
                    vm.toggle();
                    expect(vm.animationState).toEqual('expanding');
                });

                it('should set current buttons to scope buttons', function() {
                    $scope.buttons = [{icon: 'myIcon'}];
                    vm.toggle();
                    expect(vm.currentButtons).toEqual($scope.buttons);
                });

                beforeEach(function() {
                    vm.childrenActive = true;
                });
            });

            describe('if children are not active', function() {
                it('should set animation state to empty string', function() {
                    vm.toggle();
                    expect(vm.animationState).toEqual('');
                });

                it('should set active to open (toggle arg) if defined (true)', function() {
                    vm.toggle(true);
                    expect(vm.active).toEqual(true);
                });

                it('should set active to open (toggle arg) if defined (false)', function() {
                    vm.toggle(false);
                    expect(vm.active).toEqual(false);
                });

                it('should toggle active (from false) if open (toggle arg) is not defined', function() {
                    vm.active = false;
                    vm.toggle();
                    expect(vm.active).toEqual(true);
                });

                it('should toggle active (from true) if open (toggle arg) is not defined', function() {
                    vm.active = true;
                    vm.toggle();
                    expect(vm.active).toEqual(false);
                });
            });
        });

        describe('vm.close', function() {
            it('should set menu to inactive', function() {
                expect(vm.active).toBeFalsy();
            });

            it('should reset main button', function() {
                expect(vm.childrenActive).toEqual(false);
                expect(vm.activeButton).toBeUndefined();
            });

            it('should call delayTransitionButtonState', function() {
                expect(vm.currentButtons).toEqual($scope.buttons);
            });

            it('should initially set animation state to empty', function() {
                vm.animationState = 'temp';
                $timeout.and.callThrough();
                vm.toggle();

                var callback = $timeout.calls.first().args[0];
                callback();
                expect(vm.animationState).toEqual('');
            });

            it('should set animation state to closing', function() {
                expect(vm.animationState).toEqual('closing');
            });

            beforeEach(function() {
                $scope.buttons = [{icon: 'test'}];
                var closeCallback = $document.on.calls.mostRecent().args[1];
                closeCallback();
            });
        });

        describe('vm.clickTool', function() {
            it('should stop propagation if $event is provided', function() {
                var stopPropagation = jasmine.createSpy('stopPropagation');
                vm.clickTool({}, {stopPropagation: stopPropagation});

                expect(stopPropagation).toHaveBeenCalled();
            });

            it('should call button action if defined', function() {
                var buttonAction = jasmine.createSpy('action');
                vm.clickTool({action: buttonAction});
                expect(buttonAction).toHaveBeenCalled();
            });

            describe('if button has children...', function() {
                var button;

                it('should set children as active', function() {
                    vm.childrenActive = false;
                    vm.clickTool(button);
                    expect(vm.childrenActive).toEqual(true);
                });

                it('should set the button to be the main button', function() {
                    vm.clickTool(button);
                    expect(vm.activeButton).toEqual(button);
                });

                it('should initially set animation to contracting', function() {
                    $timeout.and.callThrough();
                    vm.clickTool(button);
                    expect(vm.animationState).toEqual('contracting');
                });

                it('should finally set animation to expanding', function() {
                    vm.clickTool(button);
                    expect(vm.animationState).toEqual('expanding');
                });

                beforeEach(function() {
                    vm.childrenActive = true;
                    button = {icon: 'fake', children: [
                        {icon: 'fakeChild'}
                    ]}
                });
            });

            describe('if button does not have children...', function() {
                it('should close', function() {
                    vm.clickTool({icon: 'test'});
                    expect(vm.animationState).toBe('closing');
                });
            });
        });

        describe('vm.getButtonClass', function() {
            it('should add animation state as key to class object if animation state is defined', function() {
                vm.animationState = 'testState';
                var classes = vm.getButtonClass({}, 0);
                expect(classes.testState).toEqual(true);
            });

            it('should add disabled class (disabled: true) if disabled is true', function() {
                var classes = vm.getButtonClass({disabled: true}, 0);
                expect(classes.disabled).toEqual(true);
            });

            it('should not add disabled class (disabled: false) if disabled is false', function() {
                var classes = vm.getButtonClass({disabled: false}, 0);
                expect(classes.disabled).toEqual(false);
            });

            it('should add tool icon button class according to index + 1', function() {
                var classes = vm.getButtonClass({}, 3);
                expect(classes['tool-icon-button-4-5']).toBeDefined();
            });

            it('should add tool icon button class according to number of buttons', function() {
                vm.currentButtons = [1, 2, 3, 4, 5, 6, 7];

                var classes = vm.getButtonClass({}, 0);
                expect(classes['tool-icon-button-1-7']).toBeDefined();
            });

            describe('user-defined classes', function() {
                it('should execute function if class expression is function', function() {
                    var expr = jasmine.createSpy('expr');
                    vm.getButtonClass({classes: {fake: expr}}, 0);
                    expect(expr).toHaveBeenCalled();
                });

                it('should add returned value to button classes if expression is function', function() {
                    var expr = jasmine.createSpy('expr').and.returnValue('fakeVal');
                    var classes = vm.getButtonClass({classes: {fake: expr}}, 0);
                    expect(classes.fake).toEqual('fakeVal');
                });

                it('should add expression directly if it is a string', function() {
                    var classes = vm.getButtonClass({classes: {fake: 'myFake'}}, 0);
                    expect(classes.fake).toEqual('myFake');
                });
            });

            beforeEach(function() {
                vm.currentButtons = [1, 2, 3, 4, 5];
            });
        });

        beforeEach(module('signalpath.spinny'));
        beforeEach(inject(function(_$controller_) {
            $controller = _$controller_;
            $scope = {
                $on: jasmine.createSpy('$on')
            };

            $document = {
                on: jasmine.createSpy('on'),
                off: jasmine.createSpy('off')
            };

            $timeout = jasmine.createSpy('$timeout').and.callFake(function() {
                $timeout.calls.mostRecent().args[0]();
            });

            initController()
        }));

        function initController() {
            vm = $controller('SpSpinnyController', {
                $document: $document,
                $scope: $scope,
                $timeout: $timeout
            });
        }
    });

})();
