"use strict";
///<reference types="../../../../Core/Build/FudgeCore.js"/>
var f = FudgeCore;
var FudgePhysics_Communication;
(function (FudgePhysics_Communication) {
    window.addEventListener("load", init);
    const app = document.querySelector("canvas");
    let viewPort;
    let hierarchy;
    let fps;
    const times = [];
    let fpsDisplay = document.querySelector("h2#FPS");
    let bodies = new Array();
    let ballRB;
    let speedForce = 10;
    function init(_event) {
        f.Debug.log(app);
        f.RenderManager.initialize();
        f.Physics.initializePhysics();
        hierarchy = new f.Node("Scene");
        document.addEventListener("keypress", hndKey);
        let ground = createCompleteMeshNode("Ground", new f.Material("Ground", f.ShaderFlat, new f.CoatColored(new f.Color(0.2, 0.2, 0.2, 1))), "Cube", 0, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_1);
        let cmpGroundMesh = ground.getComponent(f.ComponentTransform);
        cmpGroundMesh.local.scale(new f.Vector3(10, 0.3, 10));
        cmpGroundMesh.local.translate(new f.Vector3(0, -1.5, 0));
        hierarchy.appendChild(ground);
        bodies[0] = createCompleteMeshNode("Ball", new f.Material("Ball", f.ShaderFlat, new f.CoatColored(new f.Color(0.5, 0.5, 0.5, 1))), "Sphere", 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.GROUP_2);
        let cmpCubeTransform = bodies[0].getComponent(f.ComponentTransform);
        hierarchy.appendChild(bodies[0]);
        cmpCubeTransform.local.translate(new f.Vector3(7, 4, 0));
        ballRB = bodies[0].getComponent(f.ComponentRigidbody);
        ballRB.linearDamping = 0.1;
        ballRB.angularDamping = 0.1;
        bodies[1] = createCompleteMeshNode("Cube_-10GradZ", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), "Cube", 1, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_1);
        hierarchy.appendChild(bodies[1]);
        bodies[1].mtxLocal.translate(new f.Vector3(-7, -1.5, 0));
        bodies[1].mtxLocal.scale(new f.Vector3(10, 0.3, 10));
        bodies[1].mtxLocal.rotateZ(-10, true);
        bodies[2] = createCompleteMeshNode("Cube_-20GradZ", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), "Cube", 1, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_1);
        hierarchy.appendChild(bodies[2]);
        bodies[2].mtxLocal.translate(new f.Vector3(8, -1, 0));
        bodies[2].mtxLocal.scale(new f.Vector3(10, 0.1, 10));
        bodies[2].mtxLocal.rotateZ(20, true);
        bodies[4] = createCompleteMeshNode("Cube_15,0,10Grad", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), "Cube", 1, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.GROUP_1);
        bodies[4].mtxLocal.translate(new f.Vector3(0, -1.3, -9.5));
        bodies[4].mtxLocal.scale(new f.Vector3(10, 0.3, 10));
        bodies[4].mtxLocal.rotate(new f.Vector3(15, 0, 10), true);
        hierarchy.appendChild(bodies[4]);
        bodies[3] = createCompleteMeshNode("ResetTrigger", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(1, 1, 0, 1))), "Cube", 1, f.PHYSICS_TYPE.STATIC, f.PHYSICS_GROUP.TRIGGER);
        bodies[3].removeComponent(bodies[3].getComponent(f.ComponentMesh));
        hierarchy.appendChild(bodies[3]);
        bodies[3].mtxLocal.translate(new f.Vector3(0, -3, 0));
        bodies[3].mtxLocal.scale(new f.Vector3(40, 0.3, 40));
        bodies[3].getComponent(f.ComponentRigidbody).addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, resetBall);
        let cmpLight = new f.ComponentLight(new f.LightDirectional(f.Color.CSS("WHITE")));
        cmpLight.pivot.lookAt(new f.Vector3(0.5, -1, -0.8));
        hierarchy.addComponent(cmpLight);
        let cmpCamera = new f.ComponentCamera();
        cmpCamera.backgroundColor = f.Color.CSS("GREY");
        cmpCamera.pivot.translate(new f.Vector3(2, 4, 25));
        cmpCamera.pivot.lookAt(f.Vector3.ZERO());
        viewPort = new f.Viewport();
        viewPort.initialize("Viewport", hierarchy, cmpCamera, app);
        viewPort.showSceneGraph();
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        f.Physics.start(hierarchy);
        f.Loop.start();
    }
    function update() {
        f.Physics.world.simulate();
        viewPort.draw();
        measureFPS();
    }
    function resetBall(_event) {
        if (_event.cmpRigidbody.getContainer().name == "Ball") {
            ballRB.setPosition(new f.Vector3(0, 5, 0));
        }
    }
    function measureFPS() {
        window.requestAnimationFrame(() => {
            const now = performance.now();
            while (times.length > 0 && times[0] <= now - 1000) {
                times.shift();
            }
            times.push(now);
            fps = times.length;
            fpsDisplay.textContent = "FPS: " + fps.toString();
        });
    }
    function createCompleteMeshNode(_name, _material, _mesh, _mass, _physicsType, _group = f.PHYSICS_GROUP.DEFAULT) {
        let node = new f.Node(_name);
        let mesh;
        let meshType;
        if (_mesh == "Cube") {
            mesh = new f.MeshCube;
            meshType = f.COLLIDER_TYPE.CUBE;
        }
        if (_mesh == "Sphere") {
            mesh = new f.MeshSphere;
            meshType = f.COLLIDER_TYPE.SPHERE;
        }
        let cmpMesh = new f.ComponentMesh(mesh);
        let cmpMaterial = new f.ComponentMaterial(_material);
        let cmpTransform = new f.ComponentTransform();
        let cmpRigidbody = new f.ComponentRigidbody(_mass, _physicsType, meshType, _group);
        //cmpRigidbody.setFriction(1);
        cmpRigidbody.setRestitution(0.2);
        cmpRigidbody.setFriction(0.8);
        node.addComponent(cmpMesh);
        node.addComponent(cmpMaterial);
        node.addComponent(cmpTransform);
        node.addComponent(cmpRigidbody);
        return node;
    }
    function hndKey(_event) {
        let horizontal = 0;
        let vertical = 0;
        if (_event.code == f.KEYBOARD_CODE.A) {
            //Steer Left
            horizontal -= 1;
        }
        else if (_event.code == f.KEYBOARD_CODE.D) {
            //Steer Right
            horizontal += 1;
        }
        if (_event.code == f.KEYBOARD_CODE.W) {
            //Forward
            vertical -= 1;
        }
        else if (_event.code == f.KEYBOARD_CODE.S) {
            //Backward
            vertical += 1;
        }
        ballRB.applyForce(new f.Vector3(horizontal * speedForce, 0, vertical * speedForce));
    }
})(FudgePhysics_Communication || (FudgePhysics_Communication = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDJEQUEyRDtBQUMzRCxJQUFPLENBQUMsR0FBRyxTQUFTLENBQUM7QUFJckIsSUFBVSwwQkFBMEIsQ0FnS25DO0FBaEtELFdBQVUsMEJBQTBCO0lBRWxDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEMsTUFBTSxHQUFHLEdBQXNCLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEUsSUFBSSxRQUFvQixDQUFDO0lBQ3pCLElBQUksU0FBaUIsQ0FBQztJQUN0QixJQUFJLEdBQVcsQ0FBQztJQUNoQixNQUFNLEtBQUssR0FBYSxFQUFFLENBQUM7SUFDM0IsSUFBSSxVQUFVLEdBQWdCLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFL0QsSUFBSSxNQUFNLEdBQWEsSUFBSSxLQUFLLEVBQUUsQ0FBQztJQUNuQyxJQUFJLE1BQTRCLENBQUM7SUFDakMsSUFBSSxVQUFVLEdBQVcsRUFBRSxDQUFDO0lBSTVCLFNBQVMsSUFBSSxDQUFDLE1BQWE7UUFDekIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakIsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUM3QixDQUFDLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDOUIsU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVoQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzlDLElBQUksTUFBTSxHQUFXLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxVQUFVLEVB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QUNyRCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUV0QyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsc0JBQXNCLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDak0sU0FBUyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEQsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNyRCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFckMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLHNCQUFzQixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcE0sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDM0QsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNyRCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxRCxTQUFTLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWpDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxzQkFBc0IsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoTSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMs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VSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsVUFBVSxFQUFFLENBQUMsRUFBRSxRQUFRLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUV0RixDQUFDO0FBRUgsQ0FBQyxFQWhLUywwQkFBMEIsS0FBMUIsMEJBQTBCLFFBZ0tuQyIsInNvdXJjZXNDb250ZW50IjpbIi8vLzxyZWZlcmVuY2UgdHlwZXM9XCIuLi8uLi8uLi8uLi9Db3JlL0J1aWxkL0Z1ZGdlQ29yZS5qc1wiLz5cclxuaW1wb3J0IGYgPSBGdWRnZUNvcmU7XHJcblxyXG5cclxuXHJcbm5hbWVzcGFjZSBGdWRnZVBoeXNpY3NfQ29tbXVuaWNhdGlvbiB7XHJcblxyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBpbml0KTtcclxuICBjb25zdCBhcHA6IEhUTUxDYW52YXNFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImNhbnZhc1wiKTtcclxuICBsZXQgdmlld1BvcnQ6IGYuVmlld3BvcnQ7XHJcbiAgbGV0IGhpZXJhcmNoeTogZi5Ob2RlO1xyXG4gIGxldCBmcHM6IG51bWJlcjtcclxuICBjb25zdCB0aW1lczogbnVtYmVyW10gPSBbXTtcclxuICBsZXQgZnBzRGlzcGxheTogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiaDIjRlBTXCIpO1xyXG5cclxuICBsZXQgYm9kaWVzOiBmLk5vZGVbXSA9IG5ldyBBcnJheSgpO1xyXG4gIGxldCBiYWxsUkI6IGYuQ29tcG9uZW50UmlnaWRib2R5O1xyXG4gIGxldCBzcGVlZEZvcmNlOiBudW1iZXIgPSAxMDtcclxuXHJcblxyXG5cclxuICBmdW5jdGlvbiBpbml0KF9ldmVudDogRXZlbnQpOiB2b2lkIHtcclxuICAgIGYuRGVidWcubG9nKGFwcCk7XHJcbiAgICBmLlJlbmRlck1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xyXG4gICAgZi5QaHlzaWNzLmluaXRpYWxpemVQaHlzaWNzKCk7XHJcbiAgICBoaWVyYXJjaHkgPSBuZXcgZi5Ob2RlKFwiU2NlbmVcIik7XHJcblxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGhuZEtleSk7XHJcbiAgICBsZXQgZ3JvdW5kOiBmLk5vZGUgPSBjcmVhdGVDb21wbGV0ZU1lc2hOb2RlKFwiR3JvdW5kXCIsIG5ldyBmLk1hdGVyaWFsKFwiR3JvdW5kXCIsIGYuU2hhZGVyRmxhdCwgbmV3IGYuQ29hdENvbG9yZWQobmV3IGYuQ29sb3IoMC4yLCAwLjIsIDAuMiwgMSkpKSwgXCJDdWJlXCIsIDAsIGYuUEhZU0lDU19UWVBFLlNUQVRJQywgZi5QSFlTSUNTX0dST1VQLkdST1VQXzEpO1xyXG4gICAgbGV0IGNtcEdyb3VuZE1lc2g6IGYuQ29tcG9uZW50VHJhbnNmb3JtID0gZ3JvdW5kLmdldENvbXBvbmVudChmLkNvbXBvbmVudFRyYW5zZm9ybSk7XHJcbiAgICBjbXBHcm91bmRNZXNoLmxvY2FsLnNjYWxlKG5ldyBmLlZlY3RvcjMoMTAsIDAuMywgMTApKTtcclxuXHJcbiAgICBjbXBHcm91bmRNZXNoLmxvY2FsLnRyYW5zbGF0ZShuZXcgZi5WZWN0b3IzKDAsIC0xLjUsIDApKTtcclxuICAgIGhpZXJhcmNoeS5hcHBlbmRDaGlsZChncm91bmQpO1xyXG5cclxuICAgIGJvZGllc1swXSA9IGNyZWF0ZUNvbXBsZXRlTWVzaE5vZGUoXCJCYWxsXCIsIG5ldyBmLk1hdGVyaWFsKFwiQmFsbFwiLCBmLlNoYWRlckZsYXQsIG5ldyBmLkNvYXRDb2xvcmVkKG5ldyBmLkNvbG9yKDAuNSwgMC41LCAwLjUsIDEpKSksIFwiU3BoZXJlXCIsIDEsIGYuUEhZU0lDU19UWVBFLkRZTkFNSUMsIGYuUEhZU0lDU19HUk9VUC5HUk9VUF8yKTtcclxuICAgIGxldCBjbXBDdWJlVHJhbnNmb3JtOiBmLkNvbXBvbmVudFRyYW5zZm9ybSA9IGJvZGllc1swXS5nZXRDb21wb25lbnQoZi5Db21wb25lbnRUcmFuc2Zvcm0pO1xyXG4gICAgaGllcmFyY2h5LmFwcGVuZENoaWxkKGJvZGllc1swXSk7XHJcbiAgICBjbXBDdWJlVHJhbnNmb3JtLmxvY2FsLnRyYW5zbGF0ZShuZXcgZi5WZWN0b3IzKDcsIDQsIDApKTtcclxuICAgIGJhbGxSQiA9IGJvZGllc1swXS5nZXRDb21wb25lbnQoZi5Db21wb25lbnRSaWdpZGJvZHkpO1xyXG4gICAgYmFsbFJCLmxpbmVhckRhbXBpbmcgPSAwLjE7XHJcbiAgICBiYWxsUkIuYW5ndWxhckRhbXBpbmcgPSAwLjE7XHJcblxyXG4gICAgYm9kaWVzWzFdID0gY3JlYXRlQ29tcGxldGVNZXNoTm9kZShcIkN1YmVfLTEwR3JhZFpcIiwgbmV3IGYuTWF0ZXJpYWwoXCJDdWJlXCIsIGYuU2hhZGVyRmxhdCwgbmV3IGYuQ29hdENvbG9yZWQobmV3IGYuQ29sb3IoMSwgMSwgMCwgMSkpKSwgXCJDdWJlXCIsIDEsIGYuUEhZU0lDU19UWVBFLlNUQVRJQywgZi5QSFlTSUNTX0dST1VQLkdST1VQXzEpO1xyXG4gICAgaGllcmFyY2h5LmFwcGVuZENoaWxkKGJvZGllc1sxXSk7XHJcbiAgICBib2RpZXNbMV0ubXR4TG9jYWwudHJhbnNsYXRlKG5ldyBmLlZlY3RvcjMoLTcsIC0xLjUsIDApKTtcclxuICAgIGJvZGllc1sxXS5tdHhMb2NhbC5zY2FsZShuZXcgZi5WZWN0b3IzKDEwLCAwLjMsIDEwKSk7XHJcbiAgICBib2RpZXNbMV0ubXR4TG9jYWwucm90YXRlWigtMTAsIHRydWUpO1xyXG5cclxuICAgIGJvZGllc1syXSA9IGNyZWF0ZUNvbXBsZXRlTWVzaE5vZGUoXCJDdWJlXy0yMEdyYWRaXCIsIG5ldyBmLk1hdGVyaWFsKFwiQ3ViZVwiLCBmLlNoYWRlckZsYXQsIG5ldyBmLkNvYXRDb2xvcmVkKG5ldyBmLkNvbG9yKDEsIDEsIDAsIDEpKSksIFwiQ3ViZVwiLCAxLCBmLlBIWVNJQ1NfVFlQRS5TVEFUSUMsIGYuUEhZU0lDU19HUk9VUC5HUk9VUF8xKTtcclxuICAgIGhpZXJhcmNoeS5hcHBlbmRDaGlsZChib2RpZXNbMl0pO1xyXG4gICAgYm9kaWVzWzJdLm10eExvY2FsLnRyYW5zbGF0ZShuZXcgZi5WZWN0b3IzKDgsIC0xLCAwKSk7XHJcbiAgICBib2RpZXNbMl0ubXR4TG9jYWwuc2NhbGUobmV3IGYuVmVjdG9yMygxMCwgMC4xLCAxMCkpO1xyXG4gICAgYm9kaWVzWzJdLm10eExvY2FsLnJvdGF0ZVooMjAsIHRydWUpO1xyXG5cclxuICAgIGJvZGllc1s0XSA9IGNyZWF0ZUNvbXBsZXRlTWVzaE5vZGUoXCJDdWJlXzE1LDAsMTBHcmFkXCIsIG5ldyBmLk1hdGVyaWFsKFwiQ3ViZVwiLCBmLlNoYWRlckZsYXQsIG5ldyBmLkNvYXRDb2xvcmVkKG5ldyBmLkNvbG9yKDEsIDEsIDAsIDEpKSksIFwiQ3ViZVwiLCAxLCBmLlBIWVNJQ1NfVFlQRS5TVEFUSUMsIGYuUEhZU0lDU19HUk9VUC5HUk9VUF8xKTtcclxuICAgIGJvZGllc1s0XS5tdHhMb2NhbC50cmFuc2xhdGUobmV3IGYuVmVjdG9yMygwLCAtMS4zLCAtOS41KSk7XHJcbiAgICBib2RpZXNbNF0ubXR4TG9jYWwuc2NhbGUobmV3IGYuVmVjdG9yMygxMCwgMC4zLCAxMCkpO1xyXG4gICAgYm9kaWVzWzRdLm10eExvY2FsLnJvdGF0ZShuZXcgZi5WZWN0b3IzKDE1LCAwLCAxMCksIHRydWUpO1xyXG4gICAgaGllcmFyY2h5LmFwcGVuZENoaWxkKGJvZGllc1s0XSk7XHJcblxyXG4gICAgYm9kaWVzWzNdID0gY3JlYXRlQ29tcGxldGVNZXNoTm9kZShcIlJlc2V0VHJpZ2dlclwiLCBuZXcgZi5NYXRlcmlhbChcIkN1YmVcIiwgZi5TaGFkZXJGbGF0LCBuZXcgZi5Db2F0Q29sb3JlZChuZXcgZi5Db2xvcigxLCAxLCAwLCAxKSkpLCBcIkN1YmVcIiwgMSwgZi5QSFlTSUNTX1RZUEUuU1RBVElDLCBmLlBIWVNJQ1NfR1JPVVAuVFJJR0dFUik7XHJcbiAgICBib2RpZXNbM10ucmVtb3ZlQ29tcG9uZW50KGJvZGllc1szXS5nZXRDb21wb25lbnQoZi5Db21wb25lbnRNZXNoKSk7XHJcbiAgICBoaWVyYXJjaHkuYXBwZW5kQ2hpbGQoYm9kaWVzWzNdKTtcclxuICAgIGJvZGllc1szXS5tdHhMb2NhbC50cmFuc2xhdGUobmV3IGYuVmVjdG9yMygwLCAtMywgMCkpO1xyXG4gICAgYm9kaWVzWzNdLm10eExvY2FsLnNjYWxlKG5ldyBmLlZlY3RvcjMoNDAsIDAuMywgNDApKTtcclxuICAgIGJvZGllc1szXS5nZXRDb21wb25lbnQoZi5Db21wb25lbnRSaWdpZGJvZHkpLmFkZEV2ZW50TGlzdGVuZXIoZi5FVkVOVF9QSFlTSUNTLlRSSUdHRVJfRU5URVIsIHJlc2V0QmFsbCk7XHJcblxyXG4gICAgbGV0IGNtcExpZ2h0OiBmLkNvbXBvbmVudExpZ2h0ID0gbmV3IGYuQ29tcG9uZW50TGlnaHQobmV3IGYuTGlnaHREaXJlY3Rpb25hbChmLkNvbG9yLkNTUyhcIldISVRFXCIpKSk7XHJcbiAgICBjbXBMaWdodC5waXZvdC5sb29rQXQobmV3IGYuVmVjdG9yMygwLjUsIC0xLCAtMC44KSk7XHJcbiAgICBoaWVyYXJjaHkuYWRkQ29tcG9uZW50KGNtcExpZ2h0KTtcclxuXHJcbiAgICBsZXQgY21wQ2FtZXJhOiBmLkNvbXBvbmVudENhbWVyYSA9IG5ldyBmLkNvbXBvbmVudENhbWVyYSgpO1xyXG4gICAgY21wQ2FtZXJhLmJhY2tncm91bmRDb2xvciA9IGYuQ29sb3IuQ1NTKFwiR1JFWVwiKTtcclxuICAgIGNtcENhbWVyYS5waXZvdC50cmFuc2xhdGUobmV3IGYuVmVjdG9yMygyLCA0LCAyNSkpO1xyXG4gICAgY21wQ2FtZXJhLnBpdm90Lmxvb2tBdChmLlZlY3RvcjMuWkVSTygpKTtcclxuXHJcblxyXG4gICAgdmlld1BvcnQgPSBuZXcgZi5WaWV3cG9ydCgpO1xyXG4gICAgdmlld1BvcnQuaW5pdGlhbGl6ZShcIlZpZXdwb3J0XCIsIGhpZXJhcmNoeSwgY21wQ2FtZXJhLCBhcHApO1xyXG5cclxuICAgIHZpZXdQb3J0LnNob3dTY2VuZUdyYXBoKCk7XHJcbiAgICBmLkxvb3AuYWRkRXZlbnRMaXN0ZW5lcihmLkVWRU5ULkxPT1BfRlJBTUUsIHVwZGF0ZSk7XHJcbiAgICBmLlBoeXNpY3Muc3RhcnQoaGllcmFyY2h5KTtcclxuICAgIGYuTG9vcC5zdGFydCgpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gdXBkYXRlKCk6IHZvaWQge1xyXG4gICAgZi5QaHlzaWNzLndvcmxkLnNpbXVsYXRlKCk7XHJcbiAgICB2aWV3UG9ydC5kcmF3KCk7XHJcbiAgICBtZWFzdXJlRlBTKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgZnVuY3Rpb24gcmVzZXRCYWxsKF9ldmVudDogZi5FdmVudFBoeXNpY3MpOiB2b2lkIHtcclxuICAgIGlmIChfZXZlbnQuY21wUmlnaWRib2R5LmdldENvbnRhaW5lcigpLm5hbWUgPT0gXCJCYWxsXCIpIHtcclxuICAgICAgYmFsbFJCLnNldFBvc2l0aW9uKG5ldyBmLlZlY3RvcjMoMCwgNSwgMCkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbWVhc3VyZUZQUygpOiB2b2lkIHtcclxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xyXG4gICAgICBjb25zdCBub3c6IG51bWJlciA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICB3aGlsZSAodGltZXMubGVuZ3RoID4gMCAmJiB0aW1lc1swXSA8PSBub3cgLSAxMDAwKSB7XHJcbiAgICAgICAgdGltZXMuc2hpZnQoKTtcclxuICAgICAgfVxyXG4gICAgICB0aW1lcy5wdXNoKG5vdyk7XHJcbiAgICAgIGZwcyA9IHRpbWVzLmxlbmd0aDtcclxuICAgICAgZnBzRGlzcGxheS50ZXh0Q29udGVudCA9IFwiRlBTOiBcIiArIGZwcy50b1N0cmluZygpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjcmVhdGVDb21wbGV0ZU1lc2hOb2RlKF9uYW1lOiBzdHJpbmcsIF9tYXRlcmlhbDogZi5NYXRlcmlhbCwgX21lc2g6IHN0cmluZywgX21hc3M6IG51bWJlciwgX3BoeXNpY3NUeXBlOiBmLlBIWVNJQ1NfVFlQRSwgX2dyb3VwOiBmLlBIWVNJQ1NfR1JPVVAgPSBmLlBIWVNJQ1NfR1JPVVAuREVGQVVMVCk6IGYuTm9kZSB7XHJcbiAgICBsZXQgbm9kZTogZi5Ob2RlID0gbmV3IGYuTm9kZShfbmFtZSk7XHJcbiAgICBsZXQgbWVzaDogZi5NZXNoO1xyXG4gICAgbGV0IG1lc2hUeXBlOiBmLkNPTExJREVSX1RZUEU7XHJcbiAgICBpZiAoX21lc2ggPT0gXCJDdWJlXCIpIHtcclxuICAgICAgbWVzaCA9IG5ldyBmLk1lc2hDdWJlO1xyXG4gICAgICBtZXNoVHlwZSA9IGYuQ09MTElERVJfVFlQRS5DVUJFO1xyXG4gICAgfVxyXG4gICAgaWYgKF9tZXNoID09IFwiU3BoZXJlXCIpIHtcclxuICAgICAgbWVzaCA9IG5ldyBmLk1lc2hTcGhlcmU7XHJcbiAgICAgIG1lc2hUeXBlID0gZi5DT0xMSURFUl9UWVBFLlNQSEVSRTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgY21wTWVzaDogZi5Db21wb25lbnRNZXNoID0gbmV3IGYuQ29tcG9uZW50TWVzaChtZXNoKTtcclxuICAgIGxldCBjbXBNYXRlcmlhbDogZi5Db21wb25lbnRNYXRlcmlhbCA9IG5ldyBmLkNvbXBvbmVudE1hdGVyaWFsKF9tYXRlcmlhbCk7XHJcblxyXG4gICAgbGV0IGNtcFRyYW5zZm9ybTogZi5Db21wb25lbnRUcmFuc2Zvcm0gPSBuZXcgZi5Db21wb25lbnRUcmFuc2Zvcm0oKTtcclxuXHJcblxyXG4gICAgbGV0IGNtcFJpZ2lkYm9keTogZi5Db21wb25lbnRSaWdpZGJvZHkgPSBuZXcgZi5Db21wb25lbnRSaWdpZGJvZHkoX21hc3MsIF9waHlzaWNzVHlwZSwgbWVzaFR5cGUsIF9ncm91cCk7XHJcbiAgICAvL2NtcFJpZ2lkYm9keS5zZXRGcmljdGlvbigxKTtcclxuICAgIGNtcFJpZ2lkYm9keS5zZXRSZXN0aXR1dGlvbigwLjIpO1xyXG4gICAgY21wUmlnaWRib2R5LnNldEZyaWN0aW9uKDAuOCk7XHJcbiAgICBub2RlLmFkZENvbXBvbmVudChjbXBNZXNoKTtcclxuICAgIG5vZGUuYWRkQ29tcG9uZW50KGNtcE1hdGVyaWFsKTtcclxuICAgIG5vZGUuYWRkQ29tcG9uZW50KGNtcFRyYW5zZm9ybSk7XHJcbiAgICBub2RlLmFkZENvbXBvbmVudChjbXBSaWdpZGJvZHkpO1xyXG5cclxuICAgIHJldHVybiBub2RlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaG5kS2V5KF9ldmVudDogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xyXG4gICAgbGV0IGhvcml6b250YWw6IG51bWJlciA9IDA7XHJcbiAgICBsZXQgdmVydGljYWw6IG51bWJlciA9IDA7XHJcblxyXG4gICAgaWYgKF9ldmVudC5jb2RlID09IGYuS0VZQk9BUkRfQ09ERS5BKSB7XHJcbiAgICAgIC8vU3RlZXIgTGVmdFxyXG4gICAgICBob3Jpem9udGFsIC09IDE7XHJcbiAgICB9IGVsc2UgaWYgKF9ldmVudC5jb2RlID09IGYuS0VZQk9BUkRfQ09ERS5EKSB7XHJcbiAgICAgIC8vU3RlZXIgUmlnaHRcclxuICAgICAgaG9yaXpvbnRhbCArPSAxO1xyXG4gICAgfVxyXG4gICAgaWYgKF9ldmVudC5jb2RlID09IGYuS0VZQk9BUkRfQ09ERS5XKSB7XHJcbiAgICAgIC8vRm9yd2FyZFxyXG4gICAgICB2ZXJ0aWNhbCAtPSAxO1xyXG4gICAgfSBlbHNlIGlmIChfZXZlbnQuY29kZSA9PSBmLktFWUJPQVJEX0NPREUuUykge1xyXG4gICAgICAvL0JhY2t3YXJkXHJcbiAgICAgIHZlcnRpY2FsICs9IDE7XHJcbiAgICB9XHJcbiAgICBiYWxsUkIuYXBwbHlGb3JjZShuZXcgZi5WZWN0b3IzKGhvcml6b250YWwgKiBzcGVlZEZvcmNlLCAwLCB2ZXJ0aWNhbCAqIHNwZWVkRm9yY2UpKTtcclxuXHJcbiAgfVxyXG5cclxufSJdfQ==