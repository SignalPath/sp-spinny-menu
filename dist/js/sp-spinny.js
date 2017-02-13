(function() {
    'use strict';

    angular.module('signalpath.spinny', []);

})();
;(function() {
    'use strict';

    SpSpinnyController.$inject = ['$document', '$scope', '$timeout'];
    angular
        .module('signalpath.spinny')
        .directive('spSpinnyMenu', spSpinnyMenu)
        .controller('SpSpinnyController', SpSpinnyController);

    function spSpinnyMenu() {
        return {
            templateUrl: 'tool-spinner.directive.html',
            controller: 'SpSpinnyController as tools',
            scope: {
                buttons: '=spSpinnyMenu'
            }
        };
    }

    function SpSpinnyController($document, $scope, $timeout) {
        var vm = this;
        vm.toggle = toggle;
        vm.close = close;
        vm.clickTool = clickTool;
        vm.getButtonClass = getButtonClass;
        vm.mainTitleText = mainTitleText;

        vm.currentButtons = $scope.buttons;

        $document.on('click', close);
        $scope.$on('$destroy', function() {
            $document.off('click', close);
        });

        function toggle(open) {
            if (vm.childrenActive) {
                setMainButton(undefined);
                vm.animationState = 'contracting';
                delayTransitionButtonState($scope.buttons, 'expanding');
            } else {
                vm.animationState = '';
                vm.active = (open === undefined ? !vm.active : open);
            }
        }

        function close() { // jshint ignore:line
            $timeout(function() {
                vm.animationState = '';
                vm.active = false;
                setMainButton(undefined);
                delayTransitionButtonState($scope.buttons, 'closing');
            });
        }

        function clickTool(button, $event) {
            if ($event) {
                $event.stopPropagation();
            }

            if (button.action) {
                button.action();
            }

            if (button.children) {
                setMainButton(button);
                vm.animationState = 'contracting';
                delayTransitionButtonState(button.children, 'expanding');
            } else {
                close();
            }
        }

        function getButtonClass(button, $index) {
            var classes = {};
            var value;
            classes[vm.animationState] = !!vm.animationState;
            classes.disabled = button.disabled;
            classes['tool-icon-button-' + ($index + 1) + '-' + vm.currentButtons.length] = true;
            for (var key in button.classes) {
                value = button.classes[key];
                classes[key] = typeof value === 'function' ? value() : value;
            }

            return classes;
        }

        function setMainButton(button) {
            vm.childrenActive = !!button;
            vm.activeButton = button;
        }
        
        function mainTitleText() {
        	if (vm.childrenActive) {
        		return 'Back';
        	}
        	
        	if (vm.active) {
        		return 'Close menu';
        	}
        	
        	return 'Open menu';
        }

        function delayTransitionButtonState(buttons, animation, delay) {
            $timeout(function() {
                vm.animationState = animation;
                vm.currentButtons = buttons;
            }, delay || 250);
        }
    }

})();
angular.module("signalpath.spinny").run(["$templateCache", function($templateCache) {$templateCache.put("tool-spinner.directive.html","<div class=\"tool-icon\" ng-click=\"$event.stopPropagation(); tools.toggle()\">\n    <div class=\"icon-button icon-button-large\"\n         title=\"{{tools.mainTitleText()}}\"\n         ng-class=\"{\n            \'active\': tools.active,\n            \'return-button\': tools.childrenActive}\">\n        <i ng-if=\"!tools.childrenActive\" class=\"fa fa-wrench\"></i>\n        <i ng-if=\"tools.childrenActive\" class=\"fa\" ng-class=\"[\'fa-\' + tools.activeButton.icon]\"></i>\n    </div>\n    <div ng-repeat=\"button in tools.currentButtons\"\n         ng-show=\"tools.active\"\n         ng-click=\"tools.clickTool(button, $event)\"\n         class=\"fan-animate ng-hide icon-button tool-icon-button\"\n         ng-class=\"tools.getButtonClass(button, $index)\"\n         title=\"{{button.title}}\">\n        <i class=\"fa fa-{{button.icon}}\"></i></div>\n</div>");}]);