"use strict";
///<reference types="../../../../Core/Build/FudgeCore.js"/>
var f = FudgeCore;
//Reference Fudge, getting code completion ready and creating a shortcut f to write FudgeCode more comfortably
var Turorials_FUDGEPhysics_Lesson1;
//Reference Fudge, getting code completion ready and creating a shortcut f to write FudgeCode more comfortably
(function (Turorials_FUDGEPhysics_Lesson1) {
    //Fudge Basic Variables
    window.addEventListener("load", init);
    const app = document.querySelector("canvas"); // The html element where the scene is drawn to
    let viewPort; // The scene visualization
    let hierarchy; // You're object scene tree
    //Physical Objects
    let bodies = new Array(); // Array of all physical objects in the scene to have a quick reference
    //Setting Variables
    let materialConvexShape = new f.Material("MorningStar", f.ShaderFlat, new f.CoatColored(new f.Color(0.5, 0.4, 0.35, 1)));
    //Function to initialize the Fudge Scene with a camera, light, viewport and PHYSCIAL Objects
    function init(_event) {
        hierarchy = new f.Node("Scene"); //create the root Node where every object is parented to. Should never be changed
        //#region PHYSICS
        f.Physics.settings.defaultRestitution = 0.7;
        f.Physics.settings.defaultFriction = 1;
        //PHYSICS 
        //Creating a physically static ground plane for our physics playground. A simple scaled cube but with physics type set to static
        bodies[0] = createCompleteNode("Ground", new f.Material("Ground", f.ShaderFlat, new f.CoatColored(new f.Color(0.2, 0.2, 0.2, 1))), new f.MeshCube(), 0, f.PHYSICS_TYPE.STATIC);
        bodies[0].mtxLocal.scale(new f.Vector3(14, 0.3, 14)); //Scale the body with it's standard ComponentTransform
        bodies[0].mtxLocal.rotateX(4, true); //Give it a slight rotation so the physical objects are sliding, always from left when it's after a scaling
        hierarchy.appendChild(bodies[0]); //Add the node to the scene by adding it to the scene-root
        //CONCEPT 1 - Convex Colliders / Compound Collider - A Collider Shape that is not predefined and has no holes in it
        //e.g. something like a morning star shape a cube with pyramides as spikes on the side
        createConvexCompountCollider();
        //CONCEPT 2 - Setting Up a physical player
        //A physical player is a standard physical object of the type dynamic, BUT, you only want to rotate on Y axis, and you want to setup things
        //like a grounded variable and other movement related stuff.
        settingUpPhysicalPlayer();
        //#endregion PHYSICS
        //Standard Fudge Scene Initialization - Creating a directional light, a camera and initialize the viewport
        let cmpLight = new f.ComponentLight(new f.LightDirectional(f.Color.CSS("WHITE")));
        cmpLight.pivot.lookAt(new f.Vector3(0.5, -1, -0.8)); //Set light direction
        hierarchy.addComponent(cmpLight);
        let cmpCamera = new f.ComponentCamera();
        cmpCamera.backgroundColor = f.Color.CSS("GREY");
        cmpCamera.pivot.translate(new f.Vector3(2, 3.5, 17)); //Move camera far back so the whole scene is visible
        cmpCamera.pivot.lookAt(f.Vector3.ZERO()); //Set the camera matrix so that it looks at the center of the scene
        viewPort = new f.Viewport(); //Creating a viewport that is rendered onto the html canvas element
        viewPort.initialize("Viewport", hierarchy, cmpCamera, app); //initialize the viewport with the root node, camera and canvas
        document.addEventListener("keypress", hndKey); //Adding a listener for keypress handling
        //PHYSICS - Start using physics by telling the physics the scene root object. Physics will recalculate every transform and initialize
        f.Physics.start(hierarchy);
        //Important start the game loop after starting physics, so physics can use the current transform before it's first iteration
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update); //Tell the game loop to call the update function on each frame
        f.Loop.start(); //Stard the game loop
    }
    //Function to animate/update the Fudge scene, commonly known as gameloop
    function update() {
        f.Physics.world.simulate(); //PHYSICS - Simulate physical changes each frame, parameter to set time between frames
        viewPort.draw(); // Draw the current Fudge Scene to the canvas
    }
    // Function to quickly create a node with multiple needed FudgeComponents, including a physics component
    function createCompleteNode(_name, _material, _mesh, _mass, _physicsType, _group = f.PHYSICS_GROUP.DEFAULT, _colType = f.COLLIDER_TYPE.CUBE, _convexMesh = null) {
        let node = new f.Node(_name);
        let cmpMesh = new f.ComponentMesh(_mesh);
        let cmpMaterial = new f.ComponentMaterial(_material);
        let cmpTransform = new f.ComponentTransform();
        let cmpRigidbody = new f.ComponentRigidbody(_mass, _physicsType, _colType, _group, null, _convexMesh); //add a Float32 Array of points to the rb constructor to create a convex collider
        node.addComponent(cmpMesh);
        node.addComponent(cmpMaterial);
        node.addComponent(cmpTransform);
        node.addComponent(cmpRigidbody);
        return node;
    }
    function createConvexCompountCollider() {
        //Step 1 - define points that construct the shape you want for your collider - order is important so think about what point comes when in your shape
        let colliderVertices = new Float32Array([
            1, -1, 1,
            0, -2, 0,
            1, 1, 1,
            -1, 1, 1,
            -1, -1, 1,
            -2, 0, 0,
            1, 1, -1,
            -1, 1, -1,
            -1, -1, -1,
            0, 0, -2,
            1, -1, -1,
            2, 0, 0,
            0, 2, 0,
            0, 0, 2
        ]);
        //Step 2 - define the visual nodes that are part of your whole shape, since we have a cube that is surounded by pyramids:
        //Main Shape
        bodies[5] = createCompleteNode("Compound", materialConvexShape, new f.MeshCube, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.CONVEX, colliderVertices);
        hierarchy.appendChild(bodies[5]);
        bodies[5].mtxLocal.translate(new f.Vector3(2.5, 4, 3.5));
        bodies[5].mtxLocal.rotateX(27);
        bodies[5].mtxLocal.rotateY(32);
        //Components - Removing the Physics component on each of them since they all build one shape on the main Node only the visual nodes need to be there
        bodies[6] = createCompleteNode("CompoundUpper", materialConvexShape, new f.MeshPyramid, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
        bodies[6].removeComponent(bodies[6].getComponent(f.ComponentRigidbody));
        bodies[6].mtxLocal.translateY(0.5);
        bodies[6].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
        bodies[5].appendChild(bodies[6]); //appending the Node not to the main hierarchy but the Node it is part of
        bodies[7] = createCompleteNode("CompoundLower", materialConvexShape, new f.MeshPyramid, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
        bodies[7].removeComponent(bodies[7].getComponent(f.ComponentRigidbody));
        bodies[7].mtxLocal.rotateX(180);
        bodies[7].mtxLocal.translateY(0.5);
        bodies[7].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
        bodies[5].appendChild(bodies[7]);
        bodies[8] = createCompleteNode("CompoundLeft", materialConvexShape, new f.MeshPyramid, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
        bodies[8].removeComponent(bodies[8].getComponent(f.ComponentRigidbody));
        bodies[8].mtxLocal.rotateZ(90);
        bodies[8].mtxLocal.translateY(0.5);
        bodies[8].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
        bodies[5].appendChild(bodies[8]);
        bodies[9] = createCompleteNode("CompoundRight", materialConvexShape, new f.MeshPyramid, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
        bodies[9].removeComponent(bodies[9].getComponent(f.ComponentRigidbody));
        bodies[9].mtxLocal.rotateZ(-90);
        bodies[9].mtxLocal.translateY(0.5);
        bodies[9].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
        bodies[5].appendChild(bodies[9]);
        bodies[10] = createCompleteNode("CompoundFront", materialConvexShape, new f.MeshPyramid, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
        bodies[10].removeComponent(bodies[10].getComponent(f.ComponentRigidbody));
        bodies[10].mtxLocal.rotateX(90);
        bodies[10].mtxLocal.translateY(0.5);
        bodies[10].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
        bodies[5].appendChild(bodies[10]);
        bodies[11] = createCompleteNode("CompoundBack", materialConvexShape, new f.MeshPyramid, 1, f.PHYSICS_TYPE.DYNAMIC, f.PHYSICS_GROUP.DEFAULT, f.COLLIDER_TYPE.PYRAMID);
        bodies[11].removeComponent(bodies[11].getComponent(f.ComponentRigidbody));
        bodies[11].mtxLocal.rotateX(-90);
        bodies[11].mtxLocal.translateY(0.5);
        bodies[11].mtxLocal.scale(new f.Vector3(1, 0.5, 1));
        bodies[5].appendChild(bodies[11]);
        bodies[5].getComponent(f.ComponentRigidbody).restitution = 0.8;
    }
    function settingUpPhysicalPlayer() {
    }
    // Event Function handling keyboard input
    function hndKey(_event) {
    }
})(Turorials_FUDGEPhysics_Lesson1 || (Turorials_FUDGEPhysics_Lesson1 = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDJEQUEyRDtBQUMzRCxJQUFPLENBQUMsR0FBRyxTQUFTLENBQUM7QUFDckIsOEdBQThHO0FBRTlHLElBQVUsOEJBQThCLENBb0t2QztBQXRLRCw4R0FBOEc7QUFFOUcsV0FBVSw4QkFBOEI7SUFFdEMsdUJBQXVCO0lBQ3ZCLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEMsTUFBTSxHQUFHLEdBQXNCLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQywrQ0FBK0M7SUFDaEgsSUFBSSxRQUFvQixDQUFDLENBQUMsMEJBQTBCO0lBQ3BELElBQUksU0FBaUIsQ0FBQyxDQUFDLDJCQUEyQjtJQUdsRCxrQkFBa0I7SUFDbEIsSUFBSSxNQUFNLEdBQWEsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDLHVFQUF1RTtJQUUzRyxtQkFBbUI7SUFDbkIsSUFBSSxtQkFBbUIsR0FBZSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFckksNEZBQTRGO0lBQzVGLFNBQVMsSUFBSSxDQUFDLE1BQWE7UUFFekIsU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGlGQUFpRjtRQUVsSCxpQkFBaUI7UUFDakIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEdBQUcsR0FBRyxDQUFDO1FBQzVDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLGVBQWUsR0FBRyxDQUFDLENB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QUM7UUFDakMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwRCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQztJQUNqRSxDQUFDO0lBRUQsU0FBUyx1QkFBdUI7SUFFaEMsQ0FBQztJQUVELHlDQUF5QztJQUN6QyxTQUFTLE1BQU0sQ0FBQyxNQUFxQjtJQUdyQyxDQUFDO0FBRUgsQ0FBQyxFQXBLUyw4QkFBOEIsS0FBOUIsOEJBQThCLFFBb0t2QyIsInNvdXJjZXNDb250ZW50IjpbIi8vLzxyZWZlcmVuY2UgdHlwZXM9XCIuLi8uLi8uLi8uLi9Db3JlL0J1aWxkL0Z1ZGdlQ29yZS5qc1wiLz5cclxuaW1wb3J0IGYgPSBGdWRnZUNvcmU7XHJcbi8vUmVmZXJlbmNlIEZ1ZGdlLCBnZXR0aW5nIGNvZGUgY29tcGxldGlvbiByZWFkeSBhbmQgY3JlYXRpbmcgYSBzaG9ydGN1dCBmIHRvIHdyaXRlIEZ1ZGdlQ29kZSBtb3JlIGNvbWZvcnRhYmx5XHJcblxyXG5uYW1lc3BhY2UgVHVyb3JpYWxzX0ZVREdFUGh5c2ljc19MZXNzb24xIHtcclxuXHJcbiAgLy9GdWRnZSBCYXNpYyBWYXJpYWJsZXNcclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgaW5pdCk7XHJcbiAgY29uc3QgYXBwOiBIVE1MQ2FudmFzRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJjYW52YXNcIik7IC8vIFRoZSBodG1sIGVsZW1lbnQgd2hlcmUgdGhlIHNjZW5lIGlzIGRyYXduIHRvXHJcbiAgbGV0IHZpZXdQb3J0OiBmLlZpZXdwb3J0OyAvLyBUaGUgc2NlbmUgdmlzdWFsaXphdGlvblxyXG4gIGxldCBoaWVyYXJjaHk6IGYuTm9kZTsgLy8gWW91J3JlIG9iamVjdCBzY2VuZSB0cmVlXHJcblxyXG5cclxuICAvL1BoeXNpY2FsIE9iamVjdHNcclxuICBsZXQgYm9kaWVzOiBmLk5vZGVbXSA9IG5ldyBBcnJheSgpOyAvLyBBcnJheSBvZiBhbGwgcGh5c2ljYWwgb2JqZWN0cyBpbiB0aGUgc2NlbmUgdG8gaGF2ZSBhIHF1aWNrIHJlZmVyZW5jZVxyXG5cclxuICAvL1NldHRpbmcgVmFyaWFibGVzXHJcbiAgbGV0IG1hdGVyaWFsQ29udmV4U2hhcGU6IGYuTWF0ZXJpYWwgPSBuZXcgZi5NYXRlcmlhbChcIk1vcm5pbmdTdGFyXCIsIGYuU2hhZGVyRmxhdCwgbmV3IGYuQ29hdENvbG9yZWQobmV3IGYuQ29sb3IoMC41LCAwLjQsIDAuMzUsIDEpKSk7XHJcblxyXG4gIC8vRnVuY3Rpb24gdG8gaW5pdGlhbGl6ZSB0aGUgRnVkZ2UgU2NlbmUgd2l0aCBhIGNhbWVyYSwgbGlnaHQsIHZpZXdwb3J0IGFuZCBQSFlTQ0lBTCBPYmplY3RzXHJcbiAgZnVuY3Rpb24gaW5pdChfZXZlbnQ6IEV2ZW50KTogdm9pZCB7XHJcblxyXG4gICAgaGllcmFyY2h5ID0gbmV3IGYuTm9kZShcIlNjZW5lXCIpOyAvL2NyZWF0ZSB0aGUgcm9vdCBOb2RlIHdoZXJlIGV2ZXJ5IG9iamVjdCBpcyBwYXJlbnRlZCB0by4gU2hvdWxkIG5ldmVyIGJlIGNoYW5nZWRcclxuXHJcbiAgICAvLyNyZWdpb24gUEhZU0lDU1xyXG4gICAgZi5QaHlzaWNzLnNldHRpbmdzLmRlZmF1bHRSZXN0aXR1dGlvbiA9IDAuNztcclxuICAgIGYuUGh5c2ljcy5zZXR0aW5ncy5kZWZhdWx0RnJpY3Rpb24gPSAxO1xyXG5cclxuICAgIC8vUEhZU0lDUyBcclxuICAgIC8vQ3JlYXRpbmcgYSBwaHlzaWNhbGx5IHN0YXRpYyBncm91bmQgcGxhbmUgZm9yIG91ciBwaHlzaWNzIHBsYXlncm91bmQuIEEgc2ltcGxlIHNjYWxlZCBjdWJlIGJ1dCB3aXRoIHBoeXNpY3MgdHlwZSBzZXQgdG8gc3RhdGljXHJcbiAgICBib2RpZXNbMF0gPSBjcmVhdGVDb21wbGV0ZU5vZGUoXCJHcm91bmRcIiwgbmV3IGYuTWF0ZXJpYWwoXCJHcm91bmRcIiwgZi5TaGFkZXJGbGF0LCBuZXcgZi5Db2F0Q29sb3JlZChuZXcgZi5Db2xvcigwLjIsIDAuMiwgMC4yLCAxKSkpLCBuZXcgZi5NZXNoQ3ViZSgpLCAwLCBmLlBIWVNJQ1NfVFlQRS5TVEFUSUMpO1xyXG4gICAgYm9kaWVzWzBdLm10eExvY2FsLnNjYWxlKG5ldyBmLlZlY3RvcjMoMTQsIDAuMywgMTQpKTsgLy9TY2FsZSB0aGUgYm9keSB3aXRoIGl0J3Mgc3RhbmRhcmQgQ29tcG9uZW50VHJhbnNmb3JtXHJcbiAgICBib2RpZXNbMF0ubXR4TG9jYWwucm90YXRlWCg0LCB0cnVlKTsgLy9HaXZlIGl0IGEgc2xpZ2h0IHJvdGF0aW9uIHNvIHRoZSBwaHlzaWNhbCBvYmplY3RzIGFyZSBzbGlkaW5nLCBhbHdheXMgZnJvbSBsZWZ0IHdoZW4gaXQncyBhZnRlciBhIHNjYWxpbmdcclxuICAgIGhpZXJhcmNoeS5hcHBlbmRDaGlsZChib2RpZXNbMF0pOyAvL0FkZCB0aGUgbm9kZSB0byB0aGUgc2NlbmUgYnkgYWRkaW5nIGl0IHRvIHRoZSBzY2VuZS1yb290XHJcblxyXG5cclxuICAgIC8vQ09OQ0VQVCAxIC0gQ29udmV4IENvbGxpZGVycyAvIENvbXBvdW5kIENvbGxpZGVyIC0gQSBDb2xsaWRlciBTaGFwZSB0aGF0IGlzIG5vdCBwcmVkZWZpbmVkIGFuZCBoYXMgbm8gaG9sZXMgaW4gaXRcclxuICAgIC8vZS5nLiBzb21ldGhpbmcgbGlrZSBhIG1vcm5pbmcgc3RhciBzaGFwZSBhIGN1YmUgd2l0aCBweXJhbWlkZXMgYXMgc3Bpa2VzIG9uIHRoZSBzaWRlXHJcbiAgICBjcmVhdGVDb252ZXhDb21wb3VudENvbGxpZGVyKCk7XHJcblxyXG4gICAgLy9DT05DRVBUIDIgLSBTZXR0aW5nIFVwIGEgcGh5c2ljYWwgcGxheWVyXHJcbiAgICAvL0EgcGh5c2ljYWwgcGxheWVyIGlzIGEgc3RhbmRhcmQgcGh5c2ljYWwgb2JqZWN0IG9mIHRoZSB0eXBlIGR5bmFtaWMsIEJVVCwgeW91IG9ubHkgd2FudCB0byByb3RhdGUgb24gWSBheGlzLCBhbmQgeW91IHdhbnQgdG8gc2V0dXAgdGhpbmdzXHJcbiAgICAvL2xpa2UgYSBncm91bmRlZCB2YXJpYWJsZSBhbmQgb3RoZXIgbW92ZW1lbnQgcmVsYXRlZCBzdHVmZi5cclxuICAgIHNldHRpbmdVcFBoeXNpY2FsUGxheWVyKCk7XHJcblxyXG4gICAgLy8jZW5kcmVnaW9uIFBIWVNJQ1NcclxuXHJcblxyXG4gICAgLy9TdGFuZGFyZCBGdWRnZSBTY2VuZSBJbml0aWFsaXphdGlvbiAtIENyZWF0aW5nIGEgZGlyZWN0aW9uYWwgbGlnaHQsIGEgY2FtZXJhIGFuZCBpbml0aWFsaXplIHRoZSB2aWV3cG9ydFxyXG4gICAgbGV0IGNtcExpZ2h0OiBmLkNvbXBvbmVudExpZ2h0ID0gbmV3IGYuQ29tcG9uZW50TGlnaHQobmV3IGYuTGlnaHREaXJlY3Rpb25hbChmLkNvbG9yLkNTUyhcIldISVRFXCIpKSk7XHJcbiAgICBjbXBMaWdodC5waXZvdC5sb29rQXQobmV3IGYuVmVjdG9yMygwLjUsIC0xLCAtMC44KSk7IC8vU2V0IGxpZ2h0IGRpcmVjdGlvblxyXG4gICAgaGllcmFyY2h5LmFkZENvbXBvbmVudChjbXBMaWdodCk7XHJcblxyXG4gICAgbGV0IGNtcENhbWVyYTogZi5Db21wb25lbnRDYW1lcmEgPSBuZXcgZi5Db21wb25lbnRDYW1lcmEoKTtcclxuICAgIGNtcENhbWVyYS5iYWNrZ3JvdW5kQ29sb3IgPSBmLkNvbG9yLkNTUyhcIkdSRVlcIik7XHJcbiAgICBjbXBDYW1lcmEucGl2b3QudHJhbnNsYXRlKG5ldyBmLlZlY3RvcjMoMiwgMy41LCAxNykpOyAvL01vdmUgY2FtZXJhIGZhciBiYWNrIHNvIHRoZSB3aG9sZSBzY2VuZSBpcyB2aXNpYmxlXHJcbiAgICBjbXBDYW1lcmEucGl2b3QubG9va0F0KGYuVmVjdG9yMy5aRVJPKCkpOyAvL1NldCB0aGUgY2FtZXJhIG1hdHJpeCBzbyB0aGF0IGl0IGxvb2tzIGF0IHRoZSBjZW50ZXIgb2YgdGhlIHNjZW5lXHJcblxyXG4gICAgdmlld1BvcnQgPSBuZXcgZi5WaWV3cG9ydCgpOyAvL0NyZWF0aW5nIGEgdmlld3BvcnQgdGhhdCBpcyByZW5kZXJlZCBvbnRvIHRoZSBodG1sIGNhbnZhcyBlbGVtZW50XHJcbiAgICB2aWV3UG9ydC5pbml0aWFsaXplKFwiVmlld3BvcnRcIiwgaGllcmFyY2h5LCBjbXBDYW1lcmEsIGFwcCk7IC8vaW5pdGlhbGl6ZSB0aGUgdmlld3BvcnQgd2l0aCB0aGUgcm9vdCBub2RlLCBjYW1lcmEgYW5kIGNhbnZhc1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBobmRLZXkpOyAvL0FkZGluZyBhIGxpc3RlbmVyIGZvciBrZXlwcmVzcyBoYW5kbGluZ1xyXG5cclxuICAgIC8vUEhZU0lDUyAtIFN0YXJ0IHVzaW5nIHBoeXNpY3MgYnkgdGVsbGluZyB0aGUgcGh5c2ljcyB0aGUgc2NlbmUgcm9vdCBvYmplY3QuIFBoeXNpY3Mgd2lsbCByZWNhbGN1bGF0ZSBldmVyeSB0cmFuc2Zvcm0gYW5kIGluaXRpYWxpemVcclxuICAgIGYuUGh5c2ljcy5zdGFydChoaWVyYXJjaHkpO1xyXG5cclxuICAgIC8vSW1wb3J0YW50IHN0YXJ0IHRoZSBnYW1lIGxvb3AgYWZ0ZXIgc3RhcnRpbmcgcGh5c2ljcywgc28gcGh5c2ljcyBjYW4gdXNlIHRoZSBjdXJyZW50IHRyYW5zZm9ybSBiZWZvcmUgaXQncyBmaXJzdCBpdGVyYXRpb25cclxuICAgIGYuTG9vcC5hZGRFdmVudExpc3RlbmVyKGYuRVZFTlQuTE9PUF9GUkFNRSwgdXBkYXRlKTsgLy9UZWxsIHRoZSBnYW1lIGxvb3AgdG8gY2FsbCB0aGUgdXBkYXRlIGZ1bmN0aW9uIG9uIGVhY2ggZnJhbWVcclxuICAgIGYuTG9vcC5zdGFydCgpOyAvL1N0YXJkIHRoZSBnYW1lIGxvb3BcclxuICB9XHJcblxyXG4gIC8vRnVuY3Rpb24gdG8gYW5pbWF0ZS91cGRhdGUgdGhlIEZ1ZGdlIHNjZW5lLCBjb21tb25seSBrbm93biBhcyBnYW1lbG9vcFxyXG4gIGZ1bmN0aW9uIHVwZGF0ZSgpOiB2b2lkIHtcclxuICAgIGYuUGh5c2ljcy53b3JsZC5zaW11bGF0ZSgpOyAvL1BIWVNJQ1MgLSBTaW11bGF0ZSBwaHlzaWNhbCBjaGFuZ2VzIGVhY2ggZnJhbWUsIHBhcmFtZXRlciB0byBzZXQgdGltZSBiZXR3ZWVuIGZyYW1lc1xyXG4gICAgdmlld1BvcnQuZHJhdygpOyAvLyBEcmF3IHRoZSBjdXJyZW50IEZ1ZGdlIFNjZW5lIHRvIHRoZSBjYW52YXNcclxuICB9XHJcblxyXG4gIC8vIEZ1bmN0aW9uIHRvIHF1aWNrbHkgY3JlYXRlIGEgbm9kZSB3aXRoIG11bHRpcGxlIG5lZWRlZCBGdWRnZUNvbXBvbmVudHMsIGluY2x1ZGluZyBhIHBoeXNpY3MgY29tcG9uZW50XHJcbiAgZnVuY3Rpb24gY3JlYXRlQ29tcGxldGVOb2RlKF9uYW1lOiBzdHJpbmcsIF9tYXRlcmlhbDogZi5NYXRlcmlhbCwgX21lc2g6IGYuTWVzaCwgX21hc3M6IG51bWJlciwgX3BoeXNpY3NUeXBlOiBmLlBIWVNJQ1NfVFlQRSwgX2dyb3VwOiBmLlBIWVNJQ1NfR1JPVVAgPSBmLlBIWVNJQ1NfR1JPVVAuREVGQVVMVCwgX2NvbFR5cGU6IGYuQ09MTElERVJfVFlQRSA9IGYuQ09MTElERVJfVFlQRS5DVUJFLCBfY29udmV4TWVzaDogRmxvYXQzMkFycmF5ID0gbnVsbCk6IGYuTm9kZSB7XHJcbiAgICBsZXQgbm9kZTogZi5Ob2RlID0gbmV3IGYuTm9kZShfbmFtZSk7XHJcbiAgICBsZXQgY21wTWVzaDogZi5Db21wb25lbnRNZXNoID0gbmV3IGYuQ29tcG9uZW50TWVzaChfbWVzaCk7XHJcbiAgICBsZXQgY21wTWF0ZXJpYWw6IGYuQ29tcG9uZW50TWF0ZXJpYWwgPSBuZXcgZi5Db21wb25lbnRNYXRlcmlhbChfbWF0ZXJpYWwpO1xyXG5cclxuICAgIGxldCBjbXBUcmFuc2Zvcm06IGYuQ29tcG9uZW50VHJhbnNmb3JtID0gbmV3IGYuQ29tcG9uZW50VHJhbnNmb3JtKCk7XHJcbiAgICBsZXQgY21wUmlnaWRib2R5OiBmLkNvbXBvbmVudFJpZ2lkYm9keSA9IG5ldyBmLkNvbXBvbmVudFJpZ2lkYm9keShfbWFzcywgX3BoeXNpY3NUeXBlLCBfY29sVHlwZSwgX2dyb3VwLCBudWxsLCBfY29udmV4TWVzaCk7IC8vYWRkIGEgRmxvYXQzMiBBcnJheSBvZiBwb2ludHMgdG8gdGhlIHJiIGNvbnN0cnVjdG9yIHRvIGNyZWF0ZSBhIGNvbnZleCBjb2xsaWRlclxyXG4gICAgbm9kZS5hZGRDb21wb25lbnQoY21wTWVzaCk7XHJcbiAgICBub2RlLmFkZENvbXBvbmVudChjbXBNYXRlcmlhbCk7XHJcbiAgICBub2RlLmFkZENvbXBvbmVudChjbXBUcmFuc2Zvcm0pO1xyXG4gICAgbm9kZS5hZGRDb21wb25lbnQoY21wUmlnaWRib2R5KTtcclxuICAgIHJldHVybiBub2RlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY3JlYXRlQ29udmV4Q29tcG91bnRDb2xsaWRlcigpOiB2b2lkIHtcclxuICAgIC8vU3RlcCAxIC0gZGVmaW5lIHBvaW50cyB0aGF0IGNvbnN0cnVjdCB0aGUgc2hhcGUgeW91IHdhbnQgZm9yIHlvdXIgY29sbGlkZXIgLSBvcmRlciBpcyBpbXBvcnRhbnQgc28gdGhpbmsgYWJvdXQgd2hhdCBwb2ludCBjb21lcyB3aGVuIGluIHlvdXIgc2hhcGVcclxuICAgIGxldCBjb2xsaWRlclZlcnRpY2VzOiBGbG9hdDMyQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5XHJcbiAgICAgIChbXHJcbiAgICAgICAgMSwgLTEsIDEsICAgICAvL1N0YXJ0IG9mIHdpdGggYSBjdWJlIHBvaW50XHJcbiAgICAgICAgMCwgLTIsIDAsICAgICAvL2dvIHRvIGEgcHlyYW1pZCBwb2ludFxyXG4gICAgICAgIDEsIDEsIDEsICAgICAgLy9iYWNrIHRvIHRoZSBjdWJlXHJcbiAgICAgICAgLSAxLCAxLCAxLCAgICAvL2Fsb25nIHRoZSBjdWJlXHJcbiAgICAgICAgLSAxLCAtMSwgMSwgICAvL2Fsb25nIHRoZSBjdWJlIG9uIGEgZGlmZmVyZW50IHNpZGVcclxuICAgICAgICAtMiwgMCwgMCwgICAgIC8vZ28gdG8gYW5vdGhlciBweXJhbWlkIHBvaW50XHJcbiAgICAgICAgMSwgMSwgLTEsICAgICAvL2JhY2sgb24gdGhlIGN1YmVcclxuICAgICAgICAtIDEsIDEsIC0xLCAgIC8vYW5kIHNvIG9uLi4gaXQgaXMgbm90IGltcG9ydGFudCB0aGF0IGFsbCBwb2ludHMgYXJlIGluIGEgY29ycmVjdCBvcmRlcixcclxuICAgICAgICAtIDEsIC0xLCAtMSwgIC8vYnV0IHNpbmNlIHRoZSBwaHlzaWNzIGVuZ2luZSBpcyB0cnlpbmcgdG8gY29uc3RydWN0IGEgc2hhcGUgb3V0IG9mIHlvdXIgcG9pbnRzIHRoYXQgaXMgY2xvc2VkIG9mIGl0IHNob3VsZCBtYWtlIHNvbWUgc2Vuc2VcclxuICAgICAgICAwLCAwLCAtMixcclxuICAgICAgICAxLCAtMSwgLTEsXHJcbiAgICAgICAgMiwgMCwgMCxcclxuICAgICAgICAwLCAyLCAwLFxyXG4gICAgICAgIDAsIDAsIDJcclxuICAgICAgXSk7XHJcblxyXG4gICAgLy9TdGVwIDIgLSBkZWZpbmUgdGhlIHZpc3VhbCBub2RlcyB0aGF0IGFyZSBwYXJ0IG9mIHlvdXIgd2hvbGUgc2hhcGUsIHNpbmNlIHdlIGhhdmUgYSBjdWJlIHRoYXQgaXMgc3Vyb3VuZGVkIGJ5IHB5cmFtaWRzOlxyXG4gICAgLy9NYWluIFNoYXBlXHJcbiAgICBib2RpZXNbNV0gPSBjcmVhdGVDb21wbGV0ZU5vZGUoXCJDb21wb3VuZFwiLCBtYXRlcmlhbENvbnZleFNoYXBlLCBuZXcgZi5NZXNoQ3ViZSwgMSwgZi5QSFlTSUNTX1RZUEUuRFlOQU1JQywgZi5QSFlTSUNTX0dST1VQLkRFRkFVTFQsIGYuQ09MTElERVJfVFlQRS5DT05WRVgsIGNvbGxpZGVyVmVydGljZXMpO1xyXG4gICAgaGllcmFyY2h5LmFwcGVuZENoaWxkKGJvZGllc1s1XSk7XHJcbiAgICBib2RpZXNbNV0ubXR4TG9jYWwudHJhbnNsYXRlKG5ldyBmLlZlY3RvcjMoMi41LCA0LCAzLjUpKTtcclxuICAgIGJvZGllc1s1XS5tdHhMb2NhbC5yb3RhdGVYKDI3KTtcclxuICAgIGJvZGllc1s1XS5tdHhMb2NhbC5yb3RhdGVZKDMyKTtcclxuICAgIC8vQ29tcG9uZW50cyAtIFJlbW92aW5nIHRoZSBQaHlzaWNzIGNvbXBvbmVudCBvbiBlYWNoIG9mIHRoZW0gc2luY2UgdGhleSBhbGwgYnVpbGQgb25lIHNoYXBlIG9uIHRoZSBtYWluIE5vZGUgb25seSB0aGUgdmlzdWFsIG5vZGVzIG5lZWQgdG8gYmUgdGhlcmVcclxuICAgIGJvZGllc1s2XSA9IGNyZWF0ZUNvbXBsZXRlTm9kZShcIkNvbXBvdW5kVXBwZXJcIiwgbWF0ZXJpYWxDb252ZXhTaGFwZSwgbmV3IGYuTWVzaFB5cmFtaWQsIDEsIGYuUEhZU0lDU19UWVBFLkRZTkFNSUMsIGYuUEhZU0lDU19HUk9VUC5ERUZBVUxULCBmLkNPTExJREVSX1RZUEUuUFlSQU1JRCk7XHJcbiAgICBib2RpZXNbNl0ucmVtb3ZlQ29tcG9uZW50KGJvZGllc1s2XS5nZXRDb21wb25lbnQoZi5Db21wb25lbnRSaWdpZGJvZHkpKTtcclxuICAgIGJvZGllc1s2XS5tdHhMb2NhbC50cmFuc2xhdGVZKDAuNSk7XHJcbiAgICBib2RpZXNbNl0ubXR4TG9jYWwuc2NhbGUobmV3IGYuVmVjdG9yMygxLCAwLjUsIDEpKTtcclxuICAgIGJvZGllc1s1XS5hcHBlbmRDaGlsZChib2RpZXNbNl0pOyAvL2FwcGVuZGluZyB0aGUgTm9kZSBub3QgdG8gdGhlIG1haW4gaGllcmFyY2h5IGJ1dCB0aGUgTm9kZSBpdCBpcyBwYXJ0IG9mXHJcbiAgICBib2RpZXNbN10gPSBjcmVhdGVDb21wbGV0ZU5vZGUoXCJDb21wb3VuZExvd2VyXCIsIG1hdGVyaWFsQ29udmV4U2hhcGUsIG5ldyBmLk1lc2hQeXJhbWlkLCAxLCBmLlBIWVNJQ1NfVFlQRS5EWU5BTUlDLCBmLlBIWVNJQ1NfR1JPVVAuREVGQVVMVCwgZi5DT0xMSURFUl9UWVBFLlBZUkFNSUQpO1xyXG4gICAgYm9kaWVzWzddLnJlbW92ZUNvbXBvbmVudChib2RpZXNbN10uZ2V0Q29tcG9uZW50KGYuQ29tcG9uZW50UmlnaWRib2R5KSk7XHJcbiAgICBib2RpZXNbN10ubXR4TG9jYWwucm90YXRlWCgxODApO1xyXG4gICAgYm9kaWVzWzddLm10eExvY2FsLnRyYW5zbGF0ZVkoMC41KTtcclxuICAgIGJvZGllc1s3XS5tdHhMb2NhbC5zY2FsZShuZXcgZi5WZWN0b3IzKDEsIDAuNSwgMSkpO1xyXG4gICAgYm9kaWVzWzVdLmFwcGVuZENoaWxkKGJvZGllc1s3XSk7XHJcbiAgICBib2RpZXNbOF0gPSBjcmVhdGVDb21wbGV0ZU5vZGUoXCJDb21wb3VuZExlZnRcIiwgbWF0ZXJpYWxDb252ZXhTaGFwZSwgbmV3IGYuTWVzaFB5cmFtaWQsIDEsIGYuUEhZU0lDU19UWVBFLkRZTkFNSUMsIGYuUEhZU0lDU19HUk9VUC5ERUZBVUxULCBmLkNPTExJREVSX1RZUEUuUFlSQU1JRCk7XHJcbiAgICBib2RpZXNbOF0ucmVtb3ZlQ29tcG9uZW50KGJvZGllc1s4XS5nZXRDb21wb25lbnQoZi5Db21wb25lbnRSaWdpZGJvZHkpKTtcclxuICAgIGJvZGllc1s4XS5tdHhMb2NhbC5yb3RhdGVaKDkwKTtcclxuICAgIGJvZGllc1s4XS5tdHhMb2NhbC50cmFuc2xhdGVZKDAuNSk7XHJcbiAgICBib2RpZXNbOF0ubXR4TG9jYWwuc2NhbGUobmV3IGYuVmVjdG9yMygxLCAwLjUsIDEpKTtcclxuICAgIGJvZGllc1s1XS5hcHBlbmRDaGlsZChib2RpZXNbOF0pO1xyXG4gICAgYm9kaWVzWzldID0gY3JlYXRlQ29tcGxldGVOb2RlKFwiQ29tcG91bmRSaWdodFwiLCBtYXRlcmlhbENvbnZleFNoYXBlLCBuZXcgZi5NZXNoUHlyYW1pZCwgMSwgZi5QSFlTSUNTX1RZUEUuRFlOQU1JQywgZi5QSFlTSUNTX0dST1VQLkRFRkFVTFQsIGYuQ09MTElERVJfVFlQRS5QWVJBTUlEKTtcclxuICAgIGJvZGllc1s5XS5yZW1vdmVDb21wb25lbnQoYm9kaWVzWzldLmdldENvbXBvbmVudChmLkNvbXBvbmVudFJpZ2lkYm9keSkpO1xyXG4gICAgYm9kaWVzWzldLm10eExvY2FsLnJvdGF0ZVooLTkwKTtcclxuICAgIGJvZGllc1s5XS5tdHhMb2NhbC50cmFuc2xhdGVZKDAuNSk7XHJcbiAgICBib2RpZXNbOV0ubXR4TG9jYWwuc2NhbGUobmV3IGYuVmVjdG9yMygxLCAwLjUsIDEpKTtcclxuICAgIGJvZGllc1s1XS5hcHBlbmRDaGlsZChib2RpZXNbOV0pO1xyXG4gICAgYm9kaWVzWzEwXSA9IGNyZWF0ZUNvbXBsZXRlTm9kZShcIkNvbXBvdW5kRnJvbnRcIiwgbWF0ZXJpYWxDb252ZXhTaGFwZSwgbmV3IGYuTWVzaFB5cmFtaWQsIDEsIGYuUEhZU0lDU19UWVBFLkRZTkFNSUMsIGYuUEhZU0lDU19HUk9VUC5ERUZBVUxULCBmLkNPTExJREVSX1RZUEUuUFlSQU1JRCk7XHJcbiAgICBib2RpZXNbMTBdLnJlbW92ZUNvbXBvbmVudChib2RpZXNbMTBdLmdldENvbXBvbmVudChmLkNvbXBvbmVudFJpZ2lkYm9keSkpO1xyXG4gICAgYm9kaWVzWzEwXS5tdHhMb2NhbC5yb3RhdGVYKDkwKTtcclxuICAgIGJvZGllc1sxMF0ubXR4TG9jYWwudHJhbnNsYXRlWSgwLjUpO1xyXG4gICAgYm9kaWVzWzEwXS5tdHhMb2NhbC5zY2FsZShuZXcgZi5WZWN0b3IzKDEsIDAuNSwgMSkpO1xyXG4gICAgYm9kaWVzWzVdLmFwcGVuZENoaWxkKGJvZGllc1sxMF0pO1xyXG4gICAgYm9kaWVzWzExXSA9IGNyZWF0ZUNvbXBsZXRlTm9kZShcIkNvbXBvdW5kQmFja1wiLCBtYXRlcmlhbENvbnZleFNoYXBlLCBuZXcgZi5NZXNoUHlyYW1pZCwgMSwgZi5QSFlTSUNTX1RZUEUuRFlOQU1JQywgZi5QSFlTSUNTX0dST1VQLkRFRkFVTFQsIGYuQ09MTElERVJfVFlQRS5QWVJBTUlEKTtcclxuICAgIGJvZGllc1sxMV0ucmVtb3ZlQ29tcG9uZW50KGJvZGllc1sxMV0uZ2V0Q29tcG9uZW50KGYuQ29tcG9uZW50UmlnaWRib2R5KSk7XHJcbiAgICBib2RpZXNbMTFdLm10eExvY2FsLnJvdGF0ZVgoLTkwKTtcclxuICAgIGJvZGllc1sxMV0ubXR4TG9jYWwudHJhbnNsYXRlWSgwLjUpO1xyXG4gICAgYm9kaWVzWzExXS5tdHhMb2NhbC5zY2FsZShuZXcgZi5WZWN0b3IzKDEsIDAuNSwgMSkpO1xyXG4gICAgYm9kaWVzWzVdLmFwcGVuZENoaWxkKGJvZGllc1sxMV0pO1xyXG4gICAgYm9kaWVzWzVdLmdldENvbXBvbmVudChmLkNvbXBvbmVudFJpZ2lkYm9keSkucmVzdGl0dXRpb24gPSAwLjg7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzZXR0aW5nVXBQaHlzaWNhbFBsYXllcigpOiB2b2lkIHtcclxuXHJcbiAgfVxyXG5cclxuICAvLyBFdmVudCBGdW5jdGlvbiBoYW5kbGluZyBrZXlib2FyZCBpbnB1dFxyXG4gIGZ1bmN0aW9uIGhuZEtleShfZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcclxuXHJcblxyXG4gIH1cclxuXHJcbn0iXX0=